# Yuriy Dovzhyk — AI-Powered Developer Portfolio

Personal portfolio website with an integrated AI assistant that answers questions about projects, experience, and skills — powered by semantic search, web retrieval, and long-term memory.

**Live:** [ydovzhyk.com](https://ydovzhyk.com)

---

## Overview

This is not just a static portfolio. It combines a modern single-page layout with two AI-powered interfaces:

- **Portfolio Assistant** — a floating chat widget that knows your projects, experience, and background. Supports text and voice input (Whisper transcription).
- **Web Search Agent** — a Perplexity-style search bar at the top of the page that streams answers from the open web using multiple retrieval providers.

All portfolio content (projects, skills, experience, education, contacts) is stored as plain JavaScript data files and rendered on the client — easy to update without touching component logic.

---

## Features

### Portfolio

- Hero section with social links and direct resume download
- About, Experience, Skills, Projects, and Education sections
- Sticky project cards with live demo and GitHub links
- Contact form with email and Telegram notifications
- SEO metadata, Open Graph, sitemap, and robots.txt
- Google Tag Manager and Vercel Speed Insights
- Seasonal snow animation (Dec 7 – Feb 25)

### AI Assistant (Chat Widget)

- Answers questions about your work using a rich system prompt (`promtContent.js`)
- Voice input with real-time audio visualizer and OpenAI Whisper transcription
- Conversation memory via [Mem0](https://mem0.ai/)
- Saves discovered project URLs to Firebase Firestore
- Random avatar generation per session (Robohash)
- Sends chat history to Telegram on demand

### Web Search Agent

- Streaming responses with markdown rendering
- Multi-source retrieval: Exa, Tavily, Firecrawl
- Memory-aware follow-up questions
- Suggested queries and expandable answer panel

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Framework | Next.js 15 (App Router), React 19 |
| Styling | Tailwind CSS 4, Sass/SCSS |
| AI / LLM | OpenAI (GPT-4o, Whisper), Vercel AI SDK |
| Search | Exa, Tavily, Firecrawl |
| Memory | Mem0 |
| Database | Firebase Firestore (Admin SDK) |
| Email | Nodemailer (Gmail SMTP) |
| Notifications | Telegram Bot API |
| Analytics | Google Tag Manager, Vercel Speed Insights |
| Deployment | Vercel |

---

## Project Structure

```
portfolio_scira/
├── app/
│   ├── api/                  # API routes (AI, contact, transcribe, etc.)
│   ├── components/
│   │   ├── agent-ai/         # Web search agent UI
│   │   ├── chat-widget/      # Portfolio assistant chat
│   │   ├── homepage/         # Hero, About, Projects, Skills, etc.
│   │   └── helper/           # Shared UI utilities
│   ├── css/                  # Global styles
│   ├── layout.js             # Root layout + metadata
│   └── page.js               # Homepage composition
├── lib/                      # OpenAI and Firebase Admin clients
├── public/
│   ├── resume/               # Resume PDF (served statically)
│   └── ...                   # Static assets
└── utils/
    ├── data/                 # Portfolio content & AI prompts
    └── hooks/                # Audio recorder, URL extraction, etc.
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- API keys for the services you want to enable (see below)

### Installation

```bash
git clone https://github.com/ydovzhyk/portfolio_scira.git
cd portfolio_scira
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# OpenAI
OPENAI_API_KEY=

# Web search & retrieval
EXA_API_KEY=
TAVILY_API_KEY=
FIRECRAWL_API_KEY=

# Conversation memory
MEM0_API_KEY=
MEM0_ORG_ID=
MEM0_PROJECT_ID=

# Firebase Admin (Firestore)
PRIVATE_KEY_ID=
PRIVATE_KEY=

# Contact form
EMAIL_ADDRESS=
GMAIL_PASSKEY=

# Telegram notifications
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# Analytics
NEXT_PUBLIC_GTM=

# reCAPTCHA (optional)
NEXT_PUBLIC_RECAPTCHA_SECRET_KEY=
```

> **Note:** AI features gracefully degrade when API keys are missing — the portfolio itself works without them. Firebase is required only for the chat widget's URL-saving feature.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

---

## Customization

All portfolio content lives in `utils/data/`:

| File | Content |
|---|---|
| `personal-data.js` | Name, bio, contacts, social links, resume path |
| `projects-data.js` | Project cards (name, tools, description, links) |
| `experience.js` | Work history |
| `skills.js` | Skills marquee |
| `educations.js` | Education section |
| `contactsData.js` | Contact section info |
| `promtContent.js` | System prompt for the Portfolio Assistant |
| `promtGeneralSearch.js` | System prompt for the Web Search Agent |

### Resume

Place your PDF at `public/resume/YDovzhyk_Resume.pdf` and update the path in `personal-data.js` if the filename differs. The hero section button downloads it directly from the site.

### AI Prompts

The chat widget uses `promtContent.js` — a detailed system prompt with project descriptions, links, and response rules. Keep it in sync with `projects-data.js` when adding or updating projects.

---

## API Routes

| Route | Purpose |
|---|---|
| `/api/agent` | Portfolio Assistant (chat widget) |
| `/api/agent-ai-stream` | Web Search Agent (streaming) |
| `/api/transcribe` | Voice-to-text via Whisper |
| `/api/contact` | Contact form → email + Telegram |
| `/api/send-chat-history` | Send chat log to Telegram |
| `/api/urls` | Read saved URLs from Firestore |
| `/api/delete-url` | Remove a saved URL |
| `/api/avatar` | Generate random session avatar |
| `/api/additional-questions` | Follow-up question suggestions |
| `/api/google` | reCAPTCHA verification |

---

## Deployment

The project is optimized for [Vercel](https://vercel.com):

1. Push to GitHub
2. Import the repository in Vercel
3. Add all environment variables from `.env.local`
4. Deploy

Static assets in `public/` (including the resume PDF) are served automatically.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm start` | Run production server |
| `npm run lint` | Run ESLint |

---

## Author

**Yuriy Dovzhyk** — Full Stack Developer

- Website: [ydovzhyk.com](https://ydovzhyk.com)
- GitHub: [@ydovzhyk](https://github.com/ydovzhyk)
- LinkedIn: [yuriy-dovzhyk](https://www.linkedin.com/in/yuriy-dovzhyk/)
