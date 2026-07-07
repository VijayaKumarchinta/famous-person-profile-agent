<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=for-the-badge">
    <img alt="React 19" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=for-the-badge">
  </picture>
  <br>
  <h1>🤖 AI-Powered Profile Builder</h1>
  <p><strong>Wikipedia Extraction · AI Agent Mode · PDF/JSON Exports</strong></p>

  [![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
  [![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
  
  [![Deploy Status](https://img.shields.io/github/actions/workflow/status/VijayaKumarchinta/famous-person-profile-agent/deploy.yml?branch=main&style=for-the-badge&logo=github&label=Deploy)](https://github.com/VijayaKumarchinta/famous-person-profile-agent/actions)
  [![Live Demo](https://img.shields.io/badge/LIVE_DEMO-8A2BE2?style=for-the-badge&logo=cloudflare&logoColor=white)](https://famous-person-profile-agent.pages.dev)
  
  <p>A web application that creates structured profiles of famous people using publicly available data — powered by Wikipedia extraction by default, with an optional upgrade to AI Agent mode via Gemini.</p>

  <p><sub>Built for the <strong>AI-Powered Profile Builder Internship Assignment</strong></sub></p>
</div>

<br>

---

## 📋 Table of Contents

- [📄 PDF Examples](#-pdf-examples)
- [🚀 Quick Start](#-quick-start)
- [📖 How to Use](#-how-to-use)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [🔒 Privacy](#-privacy)
- [📝 License](#-license)

---

## 📄 PDF Examples

| Document | Link |
|----------|------|
| Landing Page | [View PDF](./public/screenshots/Landing_page.pdf) |
| Generated Profile | [View PDF](./public/screenshots/Report_generation.pdf) |
| Sample Report (Satya Nadella) | [View PDF](./public/screenshots/Satya_Nadella_Profile.pdf) |

---

## 🚀 Quick Start

<details>
<summary><strong>Click to expand setup instructions</strong></summary>

### Prerequisites

- **Node.js 18+** and **npm 9+** — [Download here](https://nodejs.org/)

### Setup

```bash
# Clone the repository
git clone https://github.com/VijayaKumarchinta/famous-person-profile-agent.git
cd famous-person-profile-agent

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |

</details>

---

## 📖 How to Use

### Step-by-Step Guide

| Step | Action | Example |
|:----:|--------|---------|
| **1** | Enter the person's full name | `Satya Nadella` |
| **2** | Provide context for accuracy | `CEO of Microsoft` |
| **3** | Click **Generate Profile** | Press `Enter` / `Ctrl+Enter` |
| **4** | Export results | PDF report or JSON |

> **💡 Tip:** If any information is not publicly available, the app marks it rather than fabricating data.

<details>
<summary><strong>AI Agent Mode (Optional)</strong></summary>

To use the "Whole Internet" AI search, create a `.env` file:
```
VITE_GEMINI_API_KEY=your_free_key_here
```
This upgrades the app from Wikipedia heuristics to a full AI Agent using Google Search Grounding.

</details>

<details>
<summary><strong>Input Guide</strong></summary>

#### Name Field
| ✅ Good Inputs | ❌ Poor Inputs |
|---------------|---------------|
| `Satya Nadella` | `Satya` (too vague) |
| `Elon Musk` | `CEO` (not a name) |
| `Marie Curie` | `Microsoft guy` (not a name) |

#### Context Field
| ✅ Good Context | Why It Helps |
|----------------|-------------|
| `CEO of Microsoft` | Distinguishes from other people named Satya Nadella |
| `Tesla CEO` | Finds the right Elon Musk |
| `physicist Nobel Prize` | Narrows to the famous scientist |

</details>

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                 User Input (Name + Context)                   │
└───────────────────────┬──────────────────────────────────────┘
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                    Wikipedia Service                          │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────────┐   │
│  │  OpenSearch  │ → │ REST Summary │ → │  Action API    │   │
│  └──────────────┘   └──────────────┘   └────────────────┘   │
│                                        ┌────────────────┐   │
│                                        │  Infobox Parser│   │
│                                        └────────────────┘   │
└───────────────────────┬──────────────────────────────────────┘
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                   Profile Extractor                           │
│   Pattern Matching & Heuristics → structured data output     │
└───────────────────────┬──────────────────────────────────────┘
                        ▼
┌──────────────────────────────────────────────────────────────┐
│              Profile Display + PDF/JSON Export                │
│              (React UI + jsPDF + JSON download)              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Frontend** | React 19 + TypeScript | UI framework |
| **Styling** | Tailwind CSS 4 | Modern responsive design |
| **Build** | Vite 7 | Fast dev + optimized builds |
| **Icons** | Lucide React | Consistent icon library |
| **PDF** | jsPDF | Client-side PDF generation |
| **Data Source** | Wikipedia API | Public information |
| **CI/CD** | GitHub Actions → Cloudflare Pages | Auto-deploy on push |

> All tools are **free and open-source**. No paid APIs required.

---

## 🔒 Privacy

| Feature | Detail |
|---------|--------|
| **Storage** | Browser localStorage (no server) |
| **Retention** | Up to 10 profiles in history |
| **Exports** | PDF and JSON — saved to Downloads |
| **Tracking** | None — no analytics or data collection |
| **API Keys** | Not required — uses public Wikipedia APIs |

---

## 📝 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>
    Built by <a href="https://github.com/VijayaKumarchinta">Vijaya Kumar Chinta</a>
    <br>
    🏠 <a href="https://github.com/VijayaKumarchinta/portfolio">View my complete portfolio</a>
  </sub>
</div>
