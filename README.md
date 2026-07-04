# AI-Powered Profile Builder

A web application that creates structured profiles of famous people using publicly available Wikipedia data. **No API keys or paid services required.**

Built for the AI-Powered Profile Builder Internship Assignment.

---

## Screenshots

| Landing Page & Input Form | Generated Profile View |
|:---:|:---:|
| ![Landing Page](./public/screenshots/landing-page.png) | ![Generated Profile](./public/screenshots/generated-profile.png) |

---

## Quick Start

### Prerequisites
- **Node.js 18+** and **npm 9+** ([nodejs.org](https://nodejs.org/))

### Setup

```bash
# Clone the repository
git clone https://github.com/VijayaKumarchinta/famous-person-profile-agent.git
cd famous-person-profile-agent

# Install dependencies
npm install

# Start development server
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## How to Use

1. **Enter Person's Name** — e.g. `Satya Nadella`
2. **Enter Context** — e.g. `CEO of Microsoft` (helps find the right person)
3. **Click "Generate Profile"** — or press `Enter` / `Ctrl+Enter`
4. **View & Export** — Download PDF report or export JSON

> If information is not publicly available, it is clearly marked instead of guessed.

---

## Generated Profile Includes

| Section | Description |
|---------|-------------|
| Executive Summary | 2-3 sentence overview |
| Full Name | From Wikipedia infobox/article |
| Nationality | Pattern matching from text |
| Current Role | Extracted from Wikipedia + context |
| Industry | Keyword-based detection |
| Current City / Country | From infobox residence |
| Biography | Wikipedia article summary |
| Career Timeline | Year-based event extraction |
| Education | Infobox + text pattern matching |
| Interests | Keyword-based detection |
| Net Worth | Financial pattern extraction |
| Recent News | Recent year mentions in article |
| References | Source links (Wikipedia, etc.) |

---

## Sample Profile

Enter **Satya Nadella** with context **CEO of Microsoft**, or click **"View Sample Profile"** on the landing page to see a pre-generated example.

---

## Architecture

```
User Input (Name + Context)
        ↓
Wikipedia API (OpenSearch → REST Summary → Full Text → Infobox)
        ↓
Profile Extractor (Pattern matching + heuristics)
        ↓
Profile Display + PDF/JSON Export
```

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 19 + TypeScript | UI framework |
| Tailwind CSS 4 | Styling |
| Vite 7 | Build tool |
| jsPDF | PDF generation |
| Lucide React | Icons |
| Wikipedia API | Public data source |

All tools are **free and open-source**.

---

## Assignment Compliance

| Requirement | Status |
|-------------|--------|
| Accept name as input | ✅ |
| Accept context as input | ✅ |
| Gather public information (Wikipedia) | ✅ |
| Generate structured profile with all fields | ✅ |
| Mark unavailable info | ✅ |
| No paid AI tools/APIs | ✅ |
| PDF downloadable report | ✅ |
| GitHub repository | ✅ |
| README with setup steps + screenshots | ✅ |
| Sample profile included | ✅ |

---

## Data & Privacy

- All data stays in your browser (`localStorage`)
- No data sent to any server
- Up to 10 profiles saved in history
- Profiles, PDFs, and JSON exports are under your control

---

## License

MIT
