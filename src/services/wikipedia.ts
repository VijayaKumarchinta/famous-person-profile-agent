import type { WikipediaData } from "../types";

const WIKI_API = "https://en.wikipedia.org/w/api.php";
const WIKI_REST = "https://en.wikipedia.org/api/rest_v1";
const TIMEOUT_MS = 15000; // 15 second timeout

/**
 * Fetch with timeout wrapper
 */
async function fetchWithTimeout(url: string, timeoutMs: number = TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your internet connection and try again.');
    }
    throw error;
  }
}

/**
 * Sanitize search query - remove special characters that might break the search
 */
function sanitizeQuery(query: string): string {
  return query
    .trim()
    .replace(/[<>{}[\]\\]/g, '') // Remove dangerous characters
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Search Wikipedia for a person and return the best matching page title
 */
async function searchWikipedia(query: string, context: string): Promise<string | null> {
  const sanitizedQuery = sanitizeQuery(query);
  
  // Try with context first for better accuracy
  const searchTerms = context 
    ? `${sanitizedQuery} ${sanitizeQuery(context)}`
    : sanitizedQuery;
  
  const params = new URLSearchParams({
    action: "opensearch",
    search: searchTerms,
    limit: "10",
    format: "json",
    origin: "*",
  });

  try {
    const response = await fetchWithTimeout(`${WIKI_API}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Wikipedia search failed with status ${response.status}`);
    }
    
    const data = await response.json();
    const titles: string[] = data[1];
    
    if (!titles || titles.length === 0) {
      // Fallback: try just the name without context
      if (context) {
        return searchWikipedia(query, "");
      }
      return null;
    }
    
    // Try to find the best match - prefer exact name matches
    const nameLower = sanitizedQuery.toLowerCase();
    const exactMatch = titles.find(t => t.toLowerCase() === nameLower);
    if (exactMatch) return exactMatch;
    
    // Check if the first result contains the queried name
    // If it doesn't (e.g. context caused wrong result like "Elon Musk's Tesla Roadster"),
    // retry without context to get the actual person's page
    const firstTitle = titles[0].toLowerCase();
    const queryWords = nameLower.split(/\s+/).filter(w => w.length > 2);
    const nameInTitle = queryWords.every(w => firstTitle.includes(w));
    
    if (!nameInTitle && context) {
      // Context skewed the search - retry with just the name
      return searchWikipedia(query, "");
    }
    
    // Otherwise return first result
    return titles[0];
  } catch (error) {
    if (error instanceof Error && error.message.includes('timed out')) {
      throw error;
    }
    console.error("Wikipedia search failed:", error);
    throw new Error('Failed to search Wikipedia. Please check your internet connection.');
  }
}

/**
 * Get the summary/extract from Wikipedia REST API
 */
async function getWikipediaSummary(
  title: string
): Promise<{ extract: string; description?: string; thumbnail?: string; pageUrl: string } | null> {
  try {
    const encodedTitle = encodeURIComponent(title);
    const response = await fetchWithTimeout(`${WIKI_REST}/page/summary/${encodedTitle}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Wikipedia API returned status ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      extract: data.extract || "",
      description: data.description || "",
      thumbnail: data.thumbnail?.source || data.originalimage?.source,
      pageUrl: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodedTitle}`,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('timed out')) {
      throw error;
    }
    console.error("Wikipedia summary fetch failed:", error);
    return null;
  }
}

/**
 * Get the full text content of a Wikipedia article
 */
async function getWikipediaFullText(title: string): Promise<string> {
  const params = new URLSearchParams({
    action: "query",
    prop: "extracts",
    exlimit: "1",
    titles: title,
    explaintext: "true",
    exsectionformat: "plain",
    format: "json",
    origin: "*",
    redirects: "1",
  });

  try {
    const response = await fetchWithTimeout(`${WIKI_API}?${params}`);
    
    if (!response.ok) {
      console.error(`Wikipedia full text API returned status ${response.status}`);
      return "";
    }
    
    const data = await response.json();
    const pages = data.query?.pages;
    
    if (pages) {
      const pageId = Object.keys(pages)[0];
      if (pageId && pageId !== "-1") {
        const extract = pages[pageId].extract || "";
        // Limit text length to avoid processing issues
        return extract.length > 50000 ? extract.substring(0, 50000) : extract;
      }
    }
    return "";
  } catch (error) {
    if (error instanceof Error && error.message.includes('timed out')) {
      throw error;
    }
    console.error("Wikipedia full text fetch failed:", error);
    return "";
  }
}

/**
 * Get Wikipedia infobox data (structured data)
 */
async function getWikipediaInfobox(title: string): Promise<Record<string, string>> {
  const params = new URLSearchParams({
    action: "query",
    prop: "revisions",
    rvprop: "content",
    rvsection: "0",
    titles: title,
    format: "json",
    origin: "*",
    redirects: "1",
  });

  try {
    const response = await fetchWithTimeout(`${WIKI_API}?${params}`);
    
    if (!response.ok) {
      return {};
    }
    
    const data = await response.json();
    const pages = data.query?.pages;
    
    if (pages) {
      const pageId = Object.keys(pages)[0];
      if (pageId && pageId !== "-1") {
        const content = pages[pageId].revisions?.[0]?.["*"] || "";
        return parseInfobox(content);
      }
    }
    return {};
  } catch (error) {
    console.error("Wikipedia infobox fetch failed:", error);
    return {};
  }
}

/**
 * Parse Wikipedia infobox markup to extract key-value pairs
 */
function parseInfobox(wikitext: string): Record<string, string> {
  const infobox: Record<string, string> = {};
  
  if (!wikitext) return infobox;
  
  // Match infobox content - handle nested templates
  const infoboxMatch = wikitext.match(/\{\{Infobox[\s\S]*?\n\}\}/i);
  if (!infoboxMatch) return infobox;
  
  const infoboxText = infoboxMatch[0];
  
  // Extract key-value pairs (e.g., | key = value)
  const lines = infoboxText.split("\n");
  for (const line of lines) {
    try {
      const match = line.match(/\|\s*(\w+[\w\s]*?)\s*=\s*(.*)/);
      if (match) {
        const key = match[1].trim().toLowerCase().replace(/\s+/g, "_");
        let value = match[2].trim();
        
        // Clean up wiki markup - handle errors gracefully
        value = cleanWikiMarkup(value);
        
        if (value && value.length > 0 && value.length < 500) {
          infobox[key] = value;
        }
      }
    } catch {
      // Skip malformed lines
      continue;
    }
  }
  
  return infobox;
}

/**
 * Clean Wikipedia markup from text
 */
function cleanWikiMarkup(text: string): string {
  if (!text) return "";
  
  try {
    let result = text
      .replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, "$2") // [[link|text]] -> text
      .replace(/\[\[([^\]]*)\]\]/g, "$1") // [[link]] -> link
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/'''([^']+)'''/g, "$1") // '''bold''' -> bold
      .replace(/''([^']+)''/g, "$1") // ''italic'' -> italic
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"');
    
    // Iteratively strip nested templates {{...}} until none remain
    let prev: string;
    do {
      prev = result;
      result = result.replace(/\{\{[^{}]*\}\}/g, "");
    } while (result !== prev);
    
    // Strip any remaining lone {{ or }} template artifacts (e.g. from multi-line templates)
    result = result.replace(/\{\{/g, "");
    result = result.replace(/\}\}/g, "");
    
    return result.replace(/\s+/g, " ").trim();
  } catch {
    return text.trim();
  }
}

/**
 * Main function: fetch all Wikipedia data for a person
 */
export async function fetchWikipediaData(
  name: string,
  context: string
): Promise<WikipediaData | null> {
  if (!name || name.trim().length === 0) {
    throw new Error("Name is required");
  }
  
  // Search for the person with context for better accuracy
  const title = await searchWikipedia(name.trim(), context.trim());
  
  if (!title) {
    return null;
  }

  // Fetch all data in parallel for speed
  const [summary, fullText, infobox] = await Promise.all([
    getWikipediaSummary(title),
    getWikipediaFullText(title),
    getWikipediaInfobox(title),
  ]);

  if (!summary) {
    return null;
  }

  return {
    title,
    extract: summary.extract,
    description: summary.description,
    fullText,
    pageUrl: summary.pageUrl,
    thumbnail: summary.thumbnail,
    infobox,
  };
}
