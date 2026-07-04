import type { ProfileData, WikipediaData, CareerEvent, EducationEntry, NewsItem } from "../types";

const NOT_AVAILABLE = "Information not publicly available";

/**
 * Extract a structured profile from Wikipedia data WITHOUT using any AI API
 * Uses pattern matching and heuristics to parse Wikipedia content
 */
export function extractProfileFromWikipedia(
  name: string,
  context: string,
  wikiData: WikipediaData
): ProfileData {
  const { extract, fullText, infobox, pageUrl, thumbnail, description } = wikiData;
  
  // Extract all profile sections with error handling
  const basicDetails = safeExtract(() => extractBasicDetails(name, context, infobox, fullText, description));
  const careerTimeline = safeExtract(() => extractCareerTimeline(fullText, infobox), []);
  const education = safeExtract(() => extractEducation(fullText, infobox), []);
  const interests = safeExtract(() => extractInterests(fullText), []);
  const netWorth = safeExtract(() => extractNetWorth(fullText, infobox), NOT_AVAILABLE);
  const recentNews = safeExtract(() => extractRecentNews(fullText), []);
  
  // Build executive summary
  const executiveSummary = buildExecutiveSummary(extract, basicDetails);
  
  // Build biography - clean and limit length
  const biography = extract 
    ? cleanText(extract).substring(0, 2000) 
    : NOT_AVAILABLE;

  return {
    name: wikiData.title || name,
    executiveSummary,
    basicDetails,
    biography,
    careerTimeline: careerTimeline.length > 0 
      ? careerTimeline 
      : [{ year: "N/A", role: NOT_AVAILABLE, organization: "N/A" }],
    education: education.length > 0 
      ? education 
      : [{ degree: NOT_AVAILABLE, institution: "N/A" }],
    interests: interests.length > 0 
      ? interests 
      : [NOT_AVAILABLE],
    netWorth,
    recentNews: recentNews.length > 0 
      ? recentNews 
      : [{ title: NOT_AVAILABLE, description: "No recent news found in public sources." }],
    references: [
      { title: `Wikipedia - ${wikiData.title}`, url: pageUrl },
    ],
    photoUrl: thumbnail,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Safe wrapper for extraction functions - returns default on error
 */
function safeExtract<T>(fn: () => T, defaultValue?: T): T {
  try {
    return fn();
  } catch (error) {
    console.error("Extraction error:", error);
    return defaultValue as T;
  }
}

/**
 * Clean and normalize text
 */
function cleanText(text: string): string {
  if (!text) return "";
  return text
    .replace(/\s+/g, " ")
    .replace(/\n+/g, " ")
    .trim();
}

function extractBasicDetails(
  name: string,
  context: string,
  infobox: Record<string, string>,
  fullText: string,
  description?: string
): ProfileData["basicDetails"] {
  
  // Full name - try multiple sources
  const fullName = infobox.name || infobox.birth_name || infobox.fullname || 
                   infobox.full_name || name;
  
  // Nationality - comprehensive extraction
  let nationality = infobox.nationality || infobox.citizenship || "";
  if (!nationality) {
    // Look for nationality patterns in text
    const nationalityPatterns = [
      /is an? ([\w\-]+(?:[\-\s][\w]+)?)\s+(?:business|politician|entrepreneur|executive|engineer|scientist|actor|actress|musician|author|writer|athlete|player|singer|artist|director|producer|philanthropist)/i,
      /born.*?in.*?([\w\s]+),\s*([\w\s]+)$/im,
      /(American|British|Indian|Chinese|German|French|Japanese|Canadian|Australian|Russian|Brazilian|Mexican|Italian|Spanish|Korean|Dutch|Swedish|Swiss|Belgian|Austrian|Irish|Scottish|Welsh|Israeli|South African|New Zealand|Singaporean|Malaysian|Filipino|Indonesian|Thai|Vietnamese|Pakistani|Bangladeshi|Nigerian|Egyptian|Saudi|Emirati|Turkish|Polish|Ukrainian|Greek|Portuguese|Danish|Norwegian|Finnish|Czech|Hungarian|Romanian|Argentinian|Chilean|Colombian|Peruvian|Venezuelan)\b/i
    ];
    
    for (const pattern of nationalityPatterns) {
      const match = fullText.match(pattern);
      if (match) {
        nationality = match[1];
        break;
      }
    }
  }
  
  // Current role - from context (required) or other sources
  let currentRole = context;
  if (!currentRole || currentRole.length === 0) {
    currentRole = infobox.occupation || infobox.title || infobox.known_for || description || "";
  }
  if (!currentRole) {
    const rolePatterns = [
      /(?:is|serves as|currently)\s+(?:the\s+)?(?:a\s+)?([A-Z][^.]*?(?:CEO|Chairman|President|Director|Founder|Executive|Manager|Officer|Minister|Governor|Senator|Actor|Actress|Singer|Musician|Athlete|Player|Author|Writer|Scientist|Professor|Doctor|Engineer)[^.]*)/i,
      /(?:is|was)\s+(?:an?\s+)?([A-Z][^.]{10,100})/i,
    ];
    for (const pattern of rolePatterns) {
      const match = fullText.match(pattern);
      if (match) {
        currentRole = cleanText(match[1]).substring(0, 150);
        break;
      }
    }
  }
  
  // Industry detection
  let industry = infobox.industry || "";
  if (!industry) {
    const industryKeywords: { pattern: RegExp; industry: string }[] = [
      { pattern: /\b(software|tech|computer|digital|IT|internet|cloud|AI|artificial intelligence)\b/i, industry: "Technology" },
      { pattern: /\b(bank|finance|invest|hedge fund|private equity|venture capital|trading)\b/i, industry: "Finance" },
      { pattern: /\b(health|medical|pharma|hospital|biotech|medicine)\b/i, industry: "Healthcare" },
      { pattern: /\b(film|movie|hollywood|bollywood|cinema|actor|actress|director)\b/i, industry: "Entertainment" },
      { pattern: /\b(sport|athlete|player|football|soccer|basketball|cricket|tennis|golf)\b/i, industry: "Sports" },
      { pattern: /\b(politic|government|senator|congress|parliament|minister|president|prime)\b/i, industry: "Politics" },
      { pattern: /\b(media|news|journalist|broadcast|television|radio)\b/i, industry: "Media" },
      { pattern: /\b(retail|store|shop|e-commerce|consumer)\b/i, industry: "Retail" },
      { pattern: /\b(manufactur|industrial|factory|production)\b/i, industry: "Manufacturing" },
      { pattern: /\b(music|singer|band|album|record|concert)\b/i, industry: "Music" },
      { pattern: /\b(author|writer|book|novel|publish)\b/i, industry: "Publishing" },
      { pattern: /\b(space|aerospace|rocket|satellite|NASA)\b/i, industry: "Aerospace" },
      { pattern: /\b(energy|oil|gas|solar|wind|renewable)\b/i, industry: "Energy" },
      { pattern: /\b(real estate|property|housing|construction)\b/i, industry: "Real Estate" },
    ];
    
    for (const { pattern, industry: ind } of industryKeywords) {
      if (pattern.test(fullText)) {
        industry = ind;
        break;
      }
    }
  }
  
  // Location extraction
  let currentCity = infobox.residence || infobox.location || infobox.home_town || "";
  let currentCountry = "";
  
  // Parse location if it contains comma
  if (currentCity.includes(",")) {
    const parts = currentCity.split(",").map(p => p.trim());
    currentCity = parts[0];
    currentCountry = parts[parts.length - 1];
  }
  
  // Try to extract country from nationality or text
  if (!currentCountry) {
    const countryPatterns: { pattern: RegExp; country: string }[] = [
      { pattern: /\bAmerican\b|United States|USA|U\.S\./i, country: "United States" },
      { pattern: /\bBritish\b|United Kingdom|UK|England/i, country: "United Kingdom" },
      { pattern: /\bIndian\b|\bIndia\b/i, country: "India" },
      { pattern: /\bChinese\b|\bChina\b/i, country: "China" },
      { pattern: /\bGerman\b|\bGermany\b/i, country: "Germany" },
      { pattern: /\bFrench\b|\bFrance\b/i, country: "France" },
      { pattern: /\bJapanese\b|\bJapan\b/i, country: "Japan" },
      { pattern: /\bCanadian\b|\bCanada\b/i, country: "Canada" },
      { pattern: /\bAustralian\b|\bAustralia\b/i, country: "Australia" },
      { pattern: /\bRussian\b|\bRussia\b/i, country: "Russia" },
      { pattern: /\bBrazilian\b|\bBrazil\b/i, country: "Brazil" },
      { pattern: /\bItalian\b|\bItaly\b/i, country: "Italy" },
      { pattern: /\bSpanish\b|\bSpain\b/i, country: "Spain" },
      { pattern: /\bKorean\b|\bSouth Korea\b/i, country: "South Korea" },
      { pattern: /\bIsraeli\b|\bIsrael\b/i, country: "Israel" },
    ];
    
    for (const { pattern, country } of countryPatterns) {
      if (pattern.test(fullText) || pattern.test(nationality)) {
        currentCountry = country;
        break;
      }
    }
  }

  return {
    fullName: cleanText(fullName) || NOT_AVAILABLE,
    nationality: cleanText(nationality) || NOT_AVAILABLE,
    currentRole: cleanText(currentRole) || NOT_AVAILABLE,
    industry: cleanText(industry) || NOT_AVAILABLE,
    currentCity: cleanText(currentCity) || NOT_AVAILABLE,
    currentCountry: cleanText(currentCountry) || NOT_AVAILABLE,
  };
}

function extractCareerTimeline(fullText: string, infobox: Record<string, string>): CareerEvent[] {
  const events: CareerEvent[] = [];
  const seen = new Set<string>();
  
  if (!fullText) return events;
  
  // Check infobox for years active
  if (infobox.years_active) {
    events.push({
      year: cleanText(infobox.years_active),
      role: "Career Active",
      organization: infobox.employer || infobox.company || infobox.organization || "Various",
    });
  }
  
  // Pattern matching for career events
  const careerPatterns = [
    // "In YYYY, [name] became/joined/founded..."
    /(?:In|Since|From|By)\s+(\d{4}),?\s+(?:\w+\s+){0,5}(became|joined|founded|appointed|elected|named|started|launched|created|established|served|took over|acquired|promoted|hired|moved)\s+(?:as\s+)?(?:the\s+)?([^.]{10,150}?)(?:\.|,|and|where)/gi,
    // "YYYY: role at organization"
    /(\d{4})(?:\s*[-–]\s*(?:\d{4}|present))?\s*[:\-–]\s*([^,\n]{10,100}?)(?:,|;|\.|$)/gi,
    // "was appointed CEO of Company in YYYY"
    /was\s+(appointed|named|elected|promoted to|became)\s+(?:as\s+)?(?:the\s+)?([^.]{5,80}?)\s+(?:in|during)\s+(\d{4})/gi,
  ];
  
  for (const pattern of careerPatterns) {
    let match;
    const tempText = fullText; // Reset for each pattern
    pattern.lastIndex = 0;
    
    while ((match = pattern.exec(tempText)) !== null && events.length < 15) {
      let year: string, detail: string, action: string = "";
      
      if (match[3] && /^\d{4}$/.test(match[3])) {
        // Pattern: "was appointed X in YYYY"
        year = match[3];
        action = match[1];
        detail = match[2];
      } else if (/^\d{4}$/.test(match[1])) {
        // Pattern: "In YYYY, became X" or "YYYY: X"
        year = match[1];
        action = match[2] || "";
        detail = match[3] || match[2] || "";
      } else {
        continue;
      }
      
      const uniqueKey = `${year}-${detail.substring(0, 30).toLowerCase()}`;
      if (seen.has(uniqueKey)) continue;
      seen.add(uniqueKey);
      
      // Parse role and organization
      let role = cleanText(detail);
      let org = "";
      
      const orgPatterns = [
        /(.+?)\s+(?:at|of|for|with)\s+(.+)/i,
        /(.+?)\s+(?:CEO|Chairman|President|Director|Head|Manager|Officer)\s+(?:of|at)\s+(.+)/i,
      ];
      
      for (const orgPattern of orgPatterns) {
        const orgMatch = role.match(orgPattern);
        if (orgMatch) {
          role = cleanText(orgMatch[1]);
          org = cleanText(orgMatch[2]);
          break;
        }
      }
      
      if (role.length > 5) {
        events.push({
          year,
          role: role.substring(0, 120),
          organization: org.substring(0, 100) || "N/A",
          description: action ? `${action.charAt(0).toUpperCase()}${action.slice(1).toLowerCase()}` : undefined,
        });
      }
    }
  }
  
  // Sort by year (oldest first)
  events.sort((a, b) => {
    const yearA = parseInt(a.year.match(/\d{4}/)?.[0] || "0");
    const yearB = parseInt(b.year.match(/\d{4}/)?.[0] || "0");
    return yearA - yearB;
  });
  
  // Deduplicate and limit
  const uniqueEvents: CareerEvent[] = [];
  const seenRoles = new Set<string>();
  
  for (const event of events) {
    const roleKey = event.role.toLowerCase().substring(0, 40);
    if (!seenRoles.has(roleKey)) {
      seenRoles.add(roleKey);
      uniqueEvents.push(event);
    }
    if (uniqueEvents.length >= 8) break;
  }
  
  return uniqueEvents;
}

function extractEducation(fullText: string, infobox: Record<string, string>): EducationEntry[] {
  const education: EducationEntry[] = [];
  const seen = new Set<string>();
  
  // Check infobox first - most reliable source
  const eduFields = ["education", "alma_mater", "almamater", "school", "university", "college"];
  for (const field of eduFields) {
    const value = infobox[field];
    if (value) {
      // Split by common separators
      const institutions = value.split(/[,;]|\band\b/).map(s => cleanText(s)).filter(s => s.length > 3);
      for (const inst of institutions) {
        const key = inst.toLowerCase().substring(0, 30);
        if (!seen.has(key) && inst.length > 3) {
          seen.add(key);
          
          // Try to determine if it's a degree or institution
          const isDegree = /\b(B\.?A\.?|B\.?S\.?|M\.?A\.?|M\.?S\.?|Ph\.?D\.?|MBA|Bachelor|Master|Doctor|Diploma)\b/i.test(inst);
          
          education.push({
            degree: isDegree ? inst : "Attended",
            institution: isDegree ? "N/A" : inst,
          });
        }
      }
    }
  }
  
  if (!fullText) return education.slice(0, 5);
  
  // Pattern matching in text
  const eduPatterns = [
    /(?:earned|received|obtained|completed|graduated with|holds?)\s+(?:a|an|his|her|their)?\s*([^.]*?(?:degree|B\.?S\.?|B\.?A\.?|M\.?S\.?|M\.?A\.?|Ph\.?D\.?|MBA|Bachelor|Master|Doctor|Diploma)[^.]*?)\s+(?:from|at)\s+(?:the\s+)?([^.,]{5,80})/gi,
    /(?:attended|studied at|enrolled at|graduated from|went to)\s+(?:the\s+)?([^.,]{5,80}(?:University|College|Institute|School|Academy)[^.,]*)/gi,
    /([A-Z][a-z]+\s+(?:University|College|Institute|School)(?:\s+of\s+[A-Z][a-z]+)?)/g,
  ];
  
  for (const pattern of eduPatterns) {
    let match;
    pattern.lastIndex = 0;
    
    while ((match = pattern.exec(fullText)) !== null && education.length < 8) {
      if (match[2]) {
        // Pattern with degree and institution
        const degree = cleanText(match[1]);
        const institution = cleanText(match[2]);
        const key = institution.toLowerCase().substring(0, 30);
        
        if (!seen.has(key) && institution.length > 5) {
          seen.add(key);
          
          // Try to extract year
          const yearMatch = fullText.slice(Math.max(0, match.index - 50), match.index + match[0].length + 50)
            .match(/\b(19|20)\d{2}\b/);
          
          // Try to extract field of study
          let field = "";
          const fieldMatch = degree.match(/(?:in|of)\s+([A-Za-z\s]+?)(?:\s+from|\s+at|$)/i);
          if (fieldMatch) field = cleanText(fieldMatch[1]);
          
          education.push({
            degree: degree.substring(0, 100),
            institution: institution.substring(0, 100),
            year: yearMatch?.[0],
            field: field || undefined,
          });
        }
      } else if (match[1]) {
        // Just institution name
        const institution = cleanText(match[1]);
        const key = institution.toLowerCase().substring(0, 30);
        
        if (!seen.has(key) && institution.length > 5) {
          seen.add(key);
          education.push({
            degree: "Attended",
            institution: institution.substring(0, 100),
          });
        }
      }
    }
  }
  
  return education.slice(0, 5);
}

function extractInterests(fullText: string): string[] {
  const interests: string[] = [];
  const seen = new Set<string>();
  
  if (!fullText) return interests;
  
  // Common interest/hobby keywords
  const interestKeywords = [
    "philanthropy", "charity", "humanitarian",
    "sports", "cricket", "football", "soccer", "basketball", "tennis", "golf", "baseball", "hockey",
    "music", "art", "painting", "sculpture",
    "reading", "books", "literature", "writing", "poetry",
    "technology", "innovation", "science",
    "sustainability", "environment", "climate change", "conservation",
    "education", "teaching", "mentoring",
    "healthcare", "medicine",
    "entrepreneurship", "startups", "business",
    "artificial intelligence", "machine learning", "AI",
    "space exploration", "astronomy", "aviation",
    "cooking", "culinary", "food",
    "travel", "exploration",
    "photography", "film", "cinema",
    "yoga", "meditation", "wellness", "fitness",
    "gaming", "video games",
    "fashion", "design",
  ];
  
  const textLower = fullText.toLowerCase();
  
  // Find interests mentioned in text
  for (const keyword of interestKeywords) {
    if (textLower.includes(keyword) && !seen.has(keyword)) {
      // Verify it's actually about the person's interest, not just mentioned
      const contextPatterns = [
        new RegExp(`(?:interested in|passionate about|loves?|enjoys?|advocates? for|supports?|involved in|known for|active in)\\s+[^.]*?${keyword}`, 'i'),
        new RegExp(`${keyword}[^.]*?(?:enthusiast|lover|fan|advocate|supporter)`, 'i'),
      ];
      
      const isRelevant = contextPatterns.some(p => p.test(fullText)) || 
                         fullText.split(keyword.toLowerCase()).length > 2; // Mentioned multiple times
      
      if (isRelevant || interests.length < 3) {
        seen.add(keyword);
        interests.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
      }
    }
  }
  
  // Also check for hobby patterns
  const hobbyPatterns = [
    /(?:hobbies?|interests?)\s+(?:include|are|involve)\s+([^.]+)/gi,
    /(?:passionate about|known for|enjoys?)\s+([^.,]{5,50})/gi,
  ];
  
  for (const pattern of hobbyPatterns) {
    let match;
    pattern.lastIndex = 0;
    
    while ((match = pattern.exec(fullText)) !== null && interests.length < 10) {
      const items = match[1].split(/,|and/).map(s => cleanText(s)).filter(s => s.length > 2 && s.length < 40);
      for (const item of items) {
        const key = item.toLowerCase();
        if (!seen.has(key) && !item.match(/^(the|a|an|his|her|their|was|is|has|have)$/i)) {
          seen.add(key);
          interests.push(item.charAt(0).toUpperCase() + item.slice(1));
        }
      }
    }
  }
  
  return interests.slice(0, 8);
}

function extractNetWorth(fullText: string, infobox: Record<string, string>): string {
  // Check infobox first
  if (infobox.net_worth) return cleanText(infobox.net_worth);
  if (infobox.networth) return cleanText(infobox.networth);
  
  if (!fullText) return NOT_AVAILABLE;
  
  // Pattern matching for net worth mentions
  const netWorthPatterns = [
    /net\s*worth\s+(?:of\s+)?(?:is\s+)?(?:approximately\s+)?(?:estimated\s+(?:at\s+)?)?(?:around\s+)?(?:over\s+)?(?:nearly\s+)?(?:about\s+)?\$?([\d,.]+\s*(?:billion|million|trillion))/gi,
    /worth\s+(?:an?\s+)?(?:estimated\s+)?(?:approximately\s+)?(?:around\s+)?\$?([\d,.]+\s*(?:billion|million|trillion))/gi,
    /\$?([\d,.]+)\s*(?:billion|million)\s+(?:net worth|fortune|wealth)/gi,
    /fortune\s+(?:of\s+)?(?:approximately\s+)?(?:estimated\s+(?:at\s+)?)?\$?([\d,.]+\s*(?:billion|million))/gi,
    /estimated\s+(?:to be\s+)?worth\s+\$?([\d,.]+\s*(?:billion|million))/gi,
  ];
  
  for (const pattern of netWorthPatterns) {
    pattern.lastIndex = 0;
    const match = pattern.exec(fullText);
    if (match) {
      const amount = cleanText(match[1]);
      return `$${amount} (as reported in public sources)`;
    }
  }
  
  // Check for Forbes/Bloomberg mentions
  const forbesPatterns = [
    /Forbes[\s\S]{0,50}?\$?([\d,.]+\s*(?:billion|million))/i,
    /Bloomberg[\s\S]{0,50}?\$?([\d,.]+\s*(?:billion|million))/i,
    /richest[\s\S]{0,50}?\$?([\d,.]+\s*(?:billion|million))/i,
  ];
  
  for (const pattern of forbesPatterns) {
    const match = fullText.match(pattern);
    if (match) {
      return `$${cleanText(match[1])} (per Forbes/Bloomberg)`;
    }
  }
  
  return NOT_AVAILABLE;
}

function extractRecentNews(fullText: string): NewsItem[] {
  const news: NewsItem[] = [];
  const seen = new Set<string>();
  
  if (!fullText) return news;
  
  const currentYear = new Date().getFullYear();
  const recentYears = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4];
  
  // Keywords that indicate newsworthy events
  const newsKeywords = [
    "announced", "launched", "acquired", "invested", "founded", "joined",
    "appointed", "released", "partnership", "agreement", "deal", "initiative",
    "campaign", "opened", "introduced", "unveiled", "signed", "awarded",
    "received", "won", "stepped down", "resigned", "retired", "returned",
    "expanded", "merged", "sold", "purchased", "donated", "committed",
  ];
  
  for (const year of recentYears) {
    const yearPatterns = [
      new RegExp(`In ${year},?\\s+([^.]{20,300}\\.)`, 'gi'),
      new RegExp(`(?:In|During|Since)\\s+(?:early|mid|late)?\\s*${year}[,:]?\\s+([^.]{20,300}\\.)`, 'gi'),
    ];
    
    for (const pattern of yearPatterns) {
      let match;
      pattern.lastIndex = 0;
      
      while ((match = pattern.exec(fullText)) !== null && news.length < 6) {
        const sentence = cleanText(match[1]);
        
        if (sentence.length < 30 || sentence.length > 300) continue;
        
        // Check if it contains newsworthy keywords
        const hasKeyword = newsKeywords.some(kw => sentence.toLowerCase().includes(kw));
        
        // Avoid duplicate content
        const key = sentence.substring(0, 50).toLowerCase();
        if (seen.has(key)) continue;
        
        if (hasKeyword || news.length < 2) {
          seen.add(key);
          news.push({
            title: sentence.length > 100 ? sentence.substring(0, 97) + "..." : sentence,
            description: sentence,
            date: year.toString(),
          });
        }
      }
    }
  }
  
  // Sort by year (most recent first)
  news.sort((a, b) => parseInt(b.date || "0") - parseInt(a.date || "0"));
  
  return news.slice(0, 5);
}

function buildExecutiveSummary(extract: string, basicDetails: ProfileData["basicDetails"]): string {
  if (!extract) {
    const parts = [basicDetails.fullName];
    if (basicDetails.currentRole !== NOT_AVAILABLE) {
      parts.push(`is ${basicDetails.currentRole}`);
    }
    if (basicDetails.industry !== NOT_AVAILABLE) {
      parts.push(`in the ${basicDetails.industry} industry`);
    }
    return parts.join(" ") + ".";
  }
  
  // Take first 2-3 sentences from extract
  const sentences = extract.match(/[^.!?]+[.!?]+/g) || [];
  const summary = sentences.slice(0, 3).join(" ").trim();
  
  // Limit length
  if (summary.length > 500) {
    return summary.substring(0, 497) + "...";
  }
  
  return summary || extract.substring(0, 300) + (extract.length > 300 ? "..." : "");
}
