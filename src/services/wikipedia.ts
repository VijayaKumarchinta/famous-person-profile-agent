import wtf from 'wtf_wikipedia';
import type { WikipediaData } from "../types";

export async function fetchWikipediaData(query: string, context: string): Promise<WikipediaData | null> {
  const options = {
    'Api-User-Agent': 'FamousPersonProfileAgent/1.0 (test@example.com)'
  };
  try {
    const doc = await wtf.fetch(query, options);
    if (!doc) {
      if (context) {
        const fallbackDoc = await wtf.fetch(`${query} ${context}`, options);
        if (!fallbackDoc) return null;
        return processDoc(fallbackDoc);
      }
      return null;
    }
    return processDoc(doc);
  } catch (error) {
    console.error("Wikipedia search failed:", error);
    throw new Error('Failed to search Wikipedia. Please check your internet connection.');
  }
}

function processDoc(doc: any): WikipediaData {
  const infobox = doc.infobox() ? doc.infobox().json() : {};
  
  // Convert wtf_wikipedia infobox format to simple Record<string, string>
  const cleanInfobox: Record<string, string> = {};
  for (const key of Object.keys(infobox)) {
    if (infobox[key]?.text) {
      cleanInfobox[key] = infobox[key].text;
    }
  }

  // Fallback: wtf_wikipedia sometimes drops keys with complex list templates (like {{Indented plainlist}})
  // We'll manually parse the raw wikitext to recover critical fields if missing
  const rawWikitext = doc.wikitext();
  const criticalKeys = ['alma_mater', 'education', 'net_worth', 'title', 'industry'];
  
  for (const key of criticalKeys) {
    if (!cleanInfobox[key]) {
      const regex = new RegExp(`\\|\\s*${key}\\s*=\\s*([^\\n]+(?:\\n(?:(?!\\|\\s*[a-z_]+\\s*=).)+)*)`, 'i');
      const match = rawWikitext.match(regex);
      if (match && match[1]) {
        // Clean up basic templates and wikitext artifacts
        let val = match[1];
        // If it's a template like {{plainlist|...}}, strip the template wrappers but keep the content
        val = val.replace(/\{\{[^|}]+\|/g, ' '); // Remove opening e.g. {{plainlist|
        val = val.replace(/\}\}/g, ' ');         // Remove closing }}
        val = val.replace(/\[\[([^|\]]+\|)?([^\]]+)\]\]/g, '$2'); // Extract link text
        val = val.replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, ''); // Remove citations
        val = val.replace(/<[^>]+>/g, ''); // Remove HTML tags
        val = val.replace(/\*/g, ', '); // Replace bullet points with commas
        val = val.replace(/\n+/g, ' '); // Collapse newlines
        val = val.trim();
        
        // Remove trailing or leading comma
        if (val.startsWith(',')) val = val.substring(1).trim();
        if (val.endsWith(',')) val = val.substring(0, val.length - 1).trim();
        // Remove multiple commas
        val = val.replace(/,\s*,/g, ',');
        
        if (val) cleanInfobox[key] = val;
      }
    }
  }

  // Get the main image
  let thumbnail = "";
  const image = doc.image();
  if (image) {
    thumbnail = image.url();
  }
  
  // Get intro text securely
  const sections = doc.sections();
  const extract = sections && sections.length > 0 && typeof sections[0].text === 'function' 
    ? sections[0].text() 
    : doc.text().substring(0, 2000);

  // Extract references
  let references: Array<{title: string, url: string}> = [];
  try {
    const rawRefs = doc.references();
    if (rawRefs && Array.isArray(rawRefs)) {
      // Map to JSON objects
      const jsonRefs = rawRefs.map((r: any) => r.json ? r.json() : {});
      
      // Filter for valid URLs and titles
      const validRefs = jsonRefs.filter((r: any) => r.url && r.url.startsWith('http') && (r.title || r.website || r.publisher));
      
      // Remove duplicates by URL
      const uniqueUrls = new Set<string>();
      
      for (const r of validRefs) {
        if (!uniqueUrls.has(r.url) && references.length < 10) {
          uniqueUrls.add(r.url);
          const title = r.title || r.website || r.publisher;
          references.push({
            title: title.length > 60 ? title.substring(0, 57) + '...' : title,
            url: r.url
          });
        }
      }
    }
  } catch (e) {
    console.error("Failed to parse references", e);
  }

  return {
    title: doc.title() || "",
    extract: extract,
    description: cleanInfobox.occupation || cleanInfobox.known_for || "",
    fullText: doc.text(),
    pageUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(doc.title() || "")}`,
    thumbnail,
    infobox: cleanInfobox,
    references,
  };
}
