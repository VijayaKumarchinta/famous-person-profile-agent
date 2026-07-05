export interface ProfileData {
  name: string;
  executiveSummary: string;
  basicDetails: {
    fullName: string;
    nationality: string;
    currentRole: string;
    industry: string;
    currentCity: string;
    currentCountry: string;
  };
  biography: string;
  careerTimeline: CareerEvent[];
  education: EducationEntry[];
  interests: string[];
  netWorth: string;
  recentNews: NewsItem[];
  references: ReferenceLink[];
  photoUrl?: string;
  generatedAt: string;
}

export interface CareerEvent {
  year: string;
  role: string;
  organization: string;
  description?: string;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  year?: string;
  field?: string;
}

export interface NewsItem {
  title: string;
  description: string;
  date?: string;
}

export interface ReferenceLink {
  title: string;
  url: string;
}

export interface WikipediaData {
  title: string;
  extract: string;
  description?: string;
  fullText: string;
  pageUrl: string;
  thumbnail?: string;
  infobox: Record<string, string>;
  references?: Array<{ title: string; url: string }>;
}
