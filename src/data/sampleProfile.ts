import type { ProfileData } from "../types";

/**
 * Sample profile for Satya Nadella - CEO of Microsoft
 * This matches the example input from the assignment requirements
 */
export const sampleProfile: ProfileData = {
  name: "Satya Nadella",
  executiveSummary:
    "Satya Narayana Nadella is an Indian-American business executive who serves as the chairman and chief executive officer (CEO) of Microsoft. Under his leadership since 2014, Microsoft has undergone a remarkable transformation, pivoting towards cloud computing and artificial intelligence, resulting in the company becoming one of the most valuable in the world with a market capitalization exceeding $3 trillion.",
  basicDetails: {
    fullName: "Satya Narayana Nadella",
    nationality: "American (Indian-born)",
    currentRole: "Chairman and Chief Executive Officer of Microsoft",
    industry: "Technology",
    currentCity: "Bellevue, Washington",
    currentCountry: "United States",
  },
  biography:
    "Satya Narayana Nadella (born August 19, 1967) is an Indian-American business executive who serves as the executive chairman and chief executive officer (CEO) of Microsoft. Born in Hyderabad, Telangana, India, Nadella earned a bachelor's degree in electrical engineering from Mangalore University, followed by a Master's in Computer Science from the University of Wisconsin–Milwaukee, and an MBA from the University of Chicago Booth School of Business. He joined Microsoft in 1992 and held several leadership positions across the company's server, tools, and cloud divisions before being appointed CEO in February 2014, succeeding Steve Ballmer. Under his transformative leadership, Microsoft shifted its focus to cloud computing (Azure), artificial intelligence, and a growth mindset culture.",
  careerTimeline: [
    {
      year: "1992",
      role: "Joined Microsoft",
      organization: "Microsoft Corporation",
      description: "Began career at Microsoft working on Windows NT",
    },
    {
      year: "2000-2007",
      role: "Vice President",
      organization: "Microsoft Business Division",
      description: "Led business solutions including Microsoft Office",
    },
    {
      year: "2007-2011",
      role: "Senior Vice President, R&D",
      organization: "Microsoft Online Services Division",
      description: "Led development of Bing search engine and online services",
    },
    {
      year: "2011-2014",
      role: "Executive Vice President",
      organization: "Cloud and Enterprise Group",
      description: "Transformed Microsoft's cloud business, grew Azure into major platform",
    },
    {
      year: "2014",
      role: "Chief Executive Officer",
      organization: "Microsoft Corporation",
      description: "Appointed as third CEO of Microsoft, succeeding Steve Ballmer",
    },
    {
      year: "2021-Present",
      role: "Chairman and CEO",
      organization: "Microsoft Corporation",
      description: "Elected as Chairman of the Board in addition to CEO role",
    },
  ],
  education: [
    {
      degree: "Bachelor of Engineering in Electrical Engineering",
      institution: "Manipal Institute of Technology (Mangalore University)",
      year: "1988",
      field: "Electrical Engineering",
    },
    {
      degree: "Master of Science (M.S.)",
      institution: "University of Wisconsin–Milwaukee",
      year: "1990",
      field: "Computer Science",
    },
    {
      degree: "Master of Business Administration (MBA)",
      institution: "University of Chicago Booth School of Business",
      year: "1997",
      field: "Business Administration",
    },
  ],
  interests: [
    "Cricket",
    "Poetry",
    "Artificial Intelligence",
    "Cloud Computing",
    "Digital Transformation",
    "Accessibility & Inclusive Design",
    "Reading",
    "Philanthropy",
  ],
  netWorth: "$110+ billion (as of 2024, per Forbes estimates)",
  recentNews: [
    {
      title: "Microsoft's $13 Billion Investment in OpenAI",
      description:
        "Under Nadella's leadership, Microsoft invested $13 billion in OpenAI and integrated AI across its product suite including Copilot features in Microsoft 365, Azure AI services, and GitHub Copilot.",
      date: "2023-2024",
    },
    {
      title: "Activision Blizzard Acquisition Completed",
      description:
        "Microsoft completed its $68.7 billion acquisition of Activision Blizzard, the largest gaming industry deal in history, significantly expanding Microsoft's gaming portfolio.",
      date: "October 2023",
    },
    {
      title: "Microsoft Reaches $3 Trillion Market Cap",
      description:
        "Under Nadella's continued leadership, Microsoft became only the second company ever to reach a $3 trillion market capitalization, driven by AI and cloud growth.",
      date: "January 2024",
    },
    {
      title: "Published 'Hit Refresh' Book",
      description:
        "Nadella authored 'Hit Refresh,' a book about his personal journey, the transformation of Microsoft, and his vision for the future of technology and society.",
      date: "2017",
    },
  ],
  references: [
    {
      title: "Wikipedia - Satya Nadella",
      url: "https://en.wikipedia.org/wiki/Satya_Nadella",
    },
    {
      title: "Microsoft Official Leadership Page",
      url: "https://www.microsoft.com/en-us/about",
    },
    {
      title: "Forbes Billionaires Profile",
      url: "https://www.forbes.com/profile/satya-nadella/",
    },
  ],
  photoUrl:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/MS-Exec-Nadella-Satya-2017-08-31-22_%28cropped%29.jpg/440px-MS-Exec-Nadella-Satya-2017-08-31-22_%28cropped%29.jpg",
  generatedAt: new Date().toISOString(),
};
