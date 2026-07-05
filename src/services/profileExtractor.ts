import type { ProfileData, WikipediaData, CareerEvent, EducationEntry, NewsItem } from "../types";

const NOT_AVAILABLE = "Information not publicly available";

/**
 * Clean text to remove extra whitespace and newlines
 */
function cleanText(text: string | undefined): string {
  if (!text) return "";
  return text.replace(/\n/g, ", ").replace(/\s+/g, " ").trim();
}

/**
 * Extract a structured profile from Wikipedia data using clean infobox fields
 */
export function extractProfileFromWikipedia(
  name: string,
  _context: string,
  wikiData: WikipediaData
): ProfileData {
  const { extract, fullText, infobox, pageUrl, thumbnail, description } = wikiData;
  
  // Basic Details
  const fullName = cleanText(infobox.birth_name || infobox.name || infobox.full_name || name);
  const nationality = cleanText(infobox.citizenship || infobox.nationality) || NOT_AVAILABLE;
  const currentRole = cleanText(infobox.occupation || infobox.known_for || infobox.title || description) || NOT_AVAILABLE;
  
  // Try to infer Industry from context or role if not explicitly set
  let industry = cleanText(infobox.industry || infobox.field);
  if (!industry) {
    const textToSearch = `${currentRole} ${fullText.substring(0, 500)}`;
    const industryKeywords = [
      { pattern: /\b(software|tech|computer|digital|IT|internet|cloud|AI|artificial intelligence)\b/i, industry: "Technology" },
      { pattern: /\b(bank|finance|invest|hedge fund|private equity|venture capital|trading)\b/i, industry: "Finance" },
      { pattern: /\b(health|medical|pharma|hospital|biotech|medicine)\b/i, industry: "Healthcare" },
      { pattern: /\b(film|movie|hollywood|bollywood|cinema|actor|actress|director|singer|music)\b/i, industry: "Entertainment" },
      { pattern: /\b(sport|athlete|player|football|soccer|basketball|cricket|tennis|golf)\b/i, industry: "Sports" },
      { pattern: /\b(politic|government|senator|congress|parliament|minister|president|prime)\b/i, industry: "Politics" },
      { pattern: /\b(media|news|journalist|broadcast|television|radio)\b/i, industry: "Media" },
      { pattern: /\b(retail|store|shop|e-commerce|consumer)\b/i, industry: "Retail" },
      { pattern: /\b(space|aerospace|rocket|satellite|NASA)\b/i, industry: "Aerospace" },
    ];
    for (const { pattern, industry: ind } of industryKeywords) {
      if (pattern.test(textToSearch)) {
        industry = ind;
        break;
      }
    }
  }

  // Current City / Country
  let currentCity = cleanText(infobox.residence || infobox.location);
  let currentCountry = "";
  if (currentCity.includes(",")) {
    const parts = currentCity.split(",").map(p => p.trim());
    currentCountry = parts[parts.length - 1];
    currentCity = parts[0];
  } else if (!currentCity && infobox.birth_place) {
    // Fallback to birth place for city/country if residence is unknown
    const parts = infobox.birth_place.split(",").map(p => p.trim());
    if (parts.length >= 2) {
      currentCountry = parts[parts.length - 1];
    }
  }

  // Fallback to nationality for country inference
  if (!currentCountry) {
    const countryPatterns = [
      { pattern: /\bAmerican\b|United States|USA|U\.S\./i, country: "United States" },
      { pattern: /\bBritish\b|United Kingdom|UK|England/i, country: "United Kingdom" },
      { pattern: /\bIndian\b|\bIndia\b/i, country: "India" },
      { pattern: /\bChinese\b|\bChina\b/i, country: "China" },
      { pattern: /\bCanadian\b|\bCanada\b/i, country: "Canada" },
      { pattern: /\bAustralian\b|\bAustralia\b/i, country: "Australia" },
    ];
    for (const { pattern, country } of countryPatterns) {
      if (pattern.test(nationality) || pattern.test(fullText.substring(0, 200))) {
        currentCountry = country;
        break;
      }
    }
  }

  const basicDetails = {
    fullName: fullName || NOT_AVAILABLE,
    nationality: nationality || NOT_AVAILABLE,
    currentRole: currentRole || NOT_AVAILABLE,
    industry: industry || NOT_AVAILABLE,
    currentCity: currentCity || NOT_AVAILABLE,
    currentCountry: currentCountry || NOT_AVAILABLE,
  };

  // Education
  const education: EducationEntry[] = [];
  const edText = cleanText(infobox.education || infobox.alma_mater);
  if (edText) {
    // If it's comma-separated, split it, otherwise take the whole thing
    const schools = edText.split(/,(?![^()]*\))/).filter(s => s.trim().length > 0);
    schools.forEach(school => {
      education.push({ degree: "Attended / Graduated", institution: school.trim() });
    });
  } else {
    // Fallback: search the text for universities
    const eduMatches = fullText.match(/(?:graduated\s+from|attended|received\s+a[^.]*?from|earned\s+a[^.]*?from)\s+([A-Z][a-zA-Z\s]+(?:University|College|Institute|School)[a-zA-Z\s]*)(?=[.,\s])/g);
    if (eduMatches) {
      const seen = new Set();
      eduMatches.forEach(match => {
        const school = match.replace(/graduated\s+from|attended|received\s+a[^.]*?from|earned\s+a[^.]*?from/i, "").trim();
        if (!seen.has(school) && school.length < 50) {
          seen.add(school);
          education.push({ degree: "Attended / Graduated", institution: school });
        }
      });
    }
  }

  // Career Timeline
  const careerTimeline: CareerEvent[] = [];
  if (infobox.years_active) {
    careerTimeline.push({
      year: cleanText(infobox.years_active),
      role: currentRole !== NOT_AVAILABLE ? currentRole : "Career Active",
      organization: cleanText(infobox.employer || infobox.organization) || "Various",
    });
  }
  // Try to parse basic events from intro text
  const introSentences = extract.split(". ");
  for (const sentence of introSentences) {
    const match = sentence.match(/(?:in|since)\s+(\d{4}),?\s+[^,.]*(became|joined|founded|appointed|elected|named|started)[^.]+/i);
    if (match) {
      careerTimeline.push({
        year: match[1],
        role: match[2],
        organization: "Public record",
        description: sentence.trim() + (sentence.endsWith(".") ? "" : "."),
      });
    }
  }

  // Net Worth
  let netWorth = cleanText(infobox.net_worth || infobox.networth);
  if (!netWorth) {
    const nwMatch = extract.match(/net\s*worth\s+[^.]*?(\$[\d,.]+\s*(?:billion|million|trillion))/i);
    if (nwMatch) netWorth = nwMatch[1];
  }

  // Biography & Executive Summary
  const biography = extract ? extract.substring(0, 2000).trim() : NOT_AVAILABLE;
  const executiveSummary = extract ? extract.split("\n\n")[0].substring(0, 500).trim() : NOT_AVAILABLE;

  // Interests
  const interests: string[] = [];
  const interestsText = cleanText(infobox.known_for || infobox.notable_works);
  if (interestsText) {
    interests.push(...interestsText.split(/,|\n/).map(i => i.trim()).filter(i => i.length > 0));
  }
  
  // Recent News (mocked from latest dates in text)
  const recentNews: NewsItem[] = [];
  const recentMatch = fullText.match(/In\s+(202[0-9]),?\s+([^.]+)/g);
  if (recentMatch) {
    // Take up to 3 recent events
    recentMatch.slice(0, 3).forEach(match => {
      const parts = match.split(/,(.+)/);
      if (parts.length >= 2) {
        recentNews.push({
          title: "Public Event or Mention",
          description: match,
          date: parts[0].replace("In", "").trim()
        });
      }
    });
  }

  return {
    name: wikiData.title || name,
    executiveSummary,
    basicDetails,
    biography,
    careerTimeline: careerTimeline.length > 0 ? careerTimeline : [{ year: "N/A", role: NOT_AVAILABLE, organization: "N/A" }],
    education: education.length > 0 ? education : [{ degree: NOT_AVAILABLE, institution: "N/A" }],
    interests: interests.length > 0 ? interests : [NOT_AVAILABLE],
    netWorth: netWorth || NOT_AVAILABLE,
    recentNews: recentNews.length > 0 ? recentNews : [{ title: NOT_AVAILABLE, description: "No recent news found in public sources." }],
    references: [
      { title: `Wikipedia - ${wikiData.title}`, url: pageUrl },
      ...(wikiData.references || [])
    ],
    photoUrl: thumbnail,
    generatedAt: new Date().toISOString(),
  };
}
