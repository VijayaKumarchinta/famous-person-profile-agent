import type { ProfileData } from "../types";

export const sampleProfile: ProfileData = {
  name: "Satya Nadella",
  executiveSummary: "Satya Nadella is an Indian-born American business executive and technology leader who has served as the Chairman and Chief Executive Officer of Microsoft since 2014. Under his leadership, Microsoft has undergone a profound cultural and strategic transformation, shifting its focus from a Windows-centric model to a cloud-first, AI-driven enterprise.\n\nHis tenure has been marked by massive strategic acquisitions, including LinkedIn and GitHub, and an aggressive pivot toward artificial intelligence, most notably through Microsoft's multibillion-dollar partnership with OpenAI. Nadella is widely credited with reviving Microsoft's market dominance and elevating its market capitalization to over $3 trillion, making it one of the most valuable companies in the world.",
  basicDetails: {
    fullName: "Satya Narayana Nadella",
    nationality: "American (born in India)",
    currentRole: "Chairman & Chief Executive Officer, Microsoft",
    industry: "Technology",
    currentCity: "Bellevue, Washington",
    currentCountry: "United States"
  },
  biography: "Satya Nadella was born in Hyderabad, India, into a Telugu-speaking Hindu family. After earning his bachelor's degree in electrical engineering from the Manipal Institute of Technology, he moved to the United States to pursue a master's in computer science at the University of Wisconsin-Milwaukee. He began his career at Sun Microsystems before joining Microsoft in 1992 as a young engineer.\n\nOver his three-decade career at Microsoft, Nadella steadily rose through the ranks, spearheading the company's move to the cloud. Prior to becoming CEO, he was the Executive Vice President of Microsoft's Cloud and Enterprise group, where he was instrumental in building and scaling Microsoft Azure into one of the world's leading cloud computing platforms.\n\nSince succeeding Steve Ballmer as CEO in February 2014, Nadella has transformed Microsoft's corporate culture to prioritize empathy, continuous learning (what he calls a 'growth mindset'), and cross-platform collaboration. In 2021, he was unanimously elected as Chairman of the Board, solidifying his unparalleled influence over the tech giant's future.",
  careerTimeline: [
    { year: "1990", role: "Technology Staff", organization: "Sun Microsystems" },
    { year: "1992", role: "Software Engineer", organization: "Microsoft" },
    { year: "1999", role: "Vice President", organization: "Microsoft bCentral" },
    { year: "2007", role: "Senior Vice President", organization: "Microsoft Online Services" },
    { year: "2011", role: "President", organization: "Server and Tools Division, Microsoft" },
    { year: "2013", role: "Executive Vice President", organization: "Cloud and Enterprise Group, Microsoft" },
    { year: "2014", role: "Chief Executive Officer", organization: "Microsoft" },
    { year: "2021", role: "Chairman of the Board", organization: "Microsoft" }
  ],
  education: [
    { degree: "Bachelor of Engineering in Electrical Engineering", institution: "Manipal Institute of Technology" },
    { degree: "Master of Science in Computer Science", institution: "University of Wisconsin-Milwaukee" },
    { degree: "Master of Business Administration (MBA)", institution: "University of Chicago Booth School of Business" }
  ],
  interests: [
    "Artificial Intelligence",
    "Cloud Computing",
    "Leadership and Organizational Culture",
    "Cricket",
    "Reading",
    "Philanthropy and Accessibility"
  ],
  netWorth: "US$1.5 - 2.0 Billion",
  recentNews: [
    {
      title: "AI Infrastructure Expansion",
      description: "Continues to lead Microsoft's aggressive AI strategy, announcing multi-billion dollar investments in AI infrastructure and data centers globally.",
      date: "2024"
    },
    {
      title: "Microsoft Copilot Rollout",
      description: "Overseeing the rapid integration and expansion of Microsoft Copilot across all consumer and enterprise productivity software.",
      date: "2024"
    },
    {
      title: "Keynote at Microsoft Build",
      description: "Regularly speaks at major tech conferences like Microsoft Build and Ignite, detailing the future of developer tools and cloud computing.",
      date: "2024"
    }
  ],
  references: [
    { title: "Microsoft Leadership Profile - Satya Nadella", url: "https://news.microsoft.com/exec/satya-nadella/" },
    { title: "LinkedIn Profile", url: "https://www.linkedin.com/in/satyanadella" },
    { title: "Forbes - Satya Nadella Profile", url: "https://www.forbes.com/profile/satya-nadella/" },
    { title: "Bloomberg - Executive Profile", url: "https://www.bloomberg.com/profile/person/16474135" },
    { title: "CNBC News Coverage", url: "https://www.cnbc.com/satya-nadella/" },
    { title: "Wikipedia - Satya Nadella", url: "https://en.wikipedia.org/wiki/Satya_Nadella" }
  ],
  photoUrl: "https://upload.wikimedia.org/wikipedia/commons/7/78/MS-Exec-Nadella-Satya-2017-08-31-22_2_%28cropped%29.jpg",
  generatedAt: new Date().toISOString()
};
