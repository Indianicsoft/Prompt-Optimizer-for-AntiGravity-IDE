<div align="center">

# ⚡ Prompt Optimizer for AntiGravity IDE

**Transform vague coding requests into structured, execution-ready prompts — built for AntiGravity IDE workflows.**

</div>

***

## What Is This?

**Prompt Optimizer for AntiGravity IDE** is an open-source developer tool that takes rough, vague, or unstructured coding requests and transforms them into highly structured, token-efficient, execution-ready prompts for [AntiGravity IDE](https://antigravity.dev) workflows.

Instead of spending time rewriting the same prompt three times hoping for a better result — you paste your raw intent, pick your mode, set your constraints, and get a polished prompt you can paste directly into Gemini 3 Flash or Claude Opus inside AntiGravity.

### The Problem It Solves

Most developers write prompts like this:

> *"Build me a Firebase social app with a profile page and messaging."*

And wonder why the model output is incomplete, inconsistent, or misses key files.

This tool transforms that into a structured, model-specific, constraint-enforced, file-targeted prompt that gets the job done the first time.

***

## Screenshots

> *(Coming soon — add yours with a PR!)*

***

## Features

### Core Engine
- **Prompt Transformation Pipeline** — analyzes raw prompts and restructures them with role framing, task framing, constraints, output targeting, and verification steps
- **Task Mode Detection** — auto-detects: New Build / Bug Fix / Enhancement / Refactor / UI Redesign / Firebase Integration / AI-ML Build / Performance / Patch / Token Compression
- **Constraint Builder** — toggle constraints like `No Frameworks`, `Browser-Only`, `Vanilla JS`, `No Node.js`, `Single-File Output`, `Plan-First Mode`, and more
- **Model Style Presets** — switch between Gemini-style compact prompt, Claude-style spec prompt, Safe Patch prompt, Full Rewrite, Browser-Only Strict

### Prompt Management
- **Save & Version Prompts** — create versions, compare before/after, label by project and model target
- **Template Library** — 20+ reusable structured prompt templates for common dev scenarios
- **Prompt Quality Scoring** — scores every prompt on Clarity, Specificity, Constraint Coverage, Token Efficiency, Output Control, Ambiguity Risk
- **Change Explanation Panel** — see exactly what the optimizer added, removed, or restructured and why

### Export & Sharing
- Copy to clipboard in one click
- Export as `.txt`, `.md`, or `.json`
- Save as a reusable template
- Share prompts via link (coming in v0.2.0)

***

## Prompt Modes Supported

| Mode | Description |
|------|-------------|
| New App Build | Greenfield project generation with file plan |
| Bug Fix | Safe, surgical fix prompt targeting specific functions |
| Enhancement | Additive features on existing codebase, non-destructive |
| Refactor | Code improvement without behavior change |
| UI Redesign | Visual overhaul with layout and style specs |
| Firebase Integration | Auth, Firestore, Storage, Realtime DB wiring |
| AI / ML Build | Browser-native inference, WebGPU, training loop, LLM architecture |
| Performance | Optimization patches with benchmarking rules |
| Multi-File Patch | Targeted file-by-file patch generation |
| Token Compression | Compress verbose prompts while preserving precision |

***

## Model Style Presets

| Preset | Best For |
|--------|----------|
| Gemini Compact | Gemini 3 Flash — tight structured directives |
| Claude Spec | Claude Opus — architecture-first specification format |
| Safe Patch | Bug fixes that must not break other files |
| Full Rewrite | Greenfield or major refactor generation |
| Browser-Only Strict | Vanilla JS, no frameworks, no Node.js, browser APIs only |

***

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML, CSS, JavaScript |
| Auth | Firebase Authentication |
| Database | Firebase Firestore |
| Hosting | Firebase Hosting |
| Prompt Engine | Modular JavaScript (no external AI API required for core optimization) |

***

## Getting Started

### Prerequisites

- Node.js (for Firebase CLI)
- A Firebase project (free tier works)

### 1. Clone the repo

```bash
git clone https://github.com/rohiththirunahari/prompt-optimizer-antigravity.git
cd prompt-optimizer-antigravity
```

### 2. Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### 3. Configure Firebase

Create a `.env` file or update `services/firebase/config.js` with your Firebase project credentials:

```js
// services/firebase/config.js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

> ⚠️ Never commit real Firebase credentials. Use environment variables or keep `config.js` in `.gitignore`.

### 4. Run locally

```bash
firebase serve
```

Or just open `index.html` in a browser if you want to test the prompt engine without Firebase auth.

### 5. Deploy

```bash
firebase deploy
```

***

## Folder Structure

```
prompt-optimizer-antigravity/
├── app/                    # App shell, routing, layout
├── components/             # Reusable UI components
├── modules/
│   ├── intent-parser/      # Detect task type from raw prompt
│   ├── classifier/         # Classify and label the prompt
│   ├── constraint-engine/  # Inject and manage constraints
│   ├── template-engine/    # Compose structured prompt from templates
│   ├── scoring-engine/     # Score prompt quality
│   └── explain-engine/     # Explain what the optimizer changed
├── services/
│   ├── firebase/           # Auth, Firestore, Hosting config
│   └── storage/            # Saved prompts, versions, templates
├── data/
│   ├── templates/          # JSON prompt templates
│   ├── presets/            # Model style presets
│   └── rules/              # Scoring and transformation rules
├── public/                 # Static assets
├── screenshots/            # App screenshots for README
├── docs/                   # Extended documentation
├── .github/                # Issue templates, PR template, workflows
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
└── CHANGELOG.md
```

***

## How the Prompt Engine Works

```
Raw Prompt Input
      │
      ▼
Intent Parser          → detects task type (build / fix / redesign...)
      │
      ▼
Prompt Classifier      → labels mode, identifies missing context
      │
      ▼
Constraint Injector    → adds applicable constraints (no frameworks, etc.)
      │
      ▼
Template Engine        → selects + fills structured prompt blueprint
      │
      ▼
Compression Optimizer  → removes redundancy, improves signal density
      │
      ▼
Output Formatter       → formats for target model style (Gemini / Claude)
      │
      ▼
Scoring Engine         → scores result and flags remaining weaknesses
      │
      ▼
Change Explainer       → lists exactly what was changed and why
      │
      ▼
Optimized Prompt Output
```

***

## Firestore Data Model

| Collection | Purpose |
|------------|---------|
| `users` | User profiles and preferences |
| `prompts` | Saved optimized prompts |
| `promptVersions` | Version history per prompt |
| `templates` | Saved and community templates |
| `presets` | Model style presets per user |
| `usageStats` | Dashboard analytics |

***

## Roadmap

### v0.1.0 — MVP ✅
- Optimizer workspace
- 10 task modes
- 5 model style presets
- Constraint toggles
- Prompt scoring
- Save and export
- Firebase auth and Firestore

### v0.2.0 — ✅
- Prompt version comparison view
- Shareable prompt links
- Community template library
- Import prompt from file

### v0.3.0 — ✅
- Team workspaces
- Prompt analytics dashboard
- GitHub integration
- AntiGravity IDE plugin (research phase)

### v1.0.0 — Stable Release ✅
- Stable public API
- Full docs site
- Contributor template pack
- Extended model presets

***

## Contributing

Contributions are warmly welcomed. This project is designed specifically so that adding new prompt templates, scoring rules, model presets, or transformation passes is easy and doesn't require understanding the entire codebase.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup, rules, and the contribution paths best suited for first-time contributors.

***

## License

Distributed under the MIT License. See [LICENSE](./LICENSE) for full text.

***

## Built By

**Rohith Thirunahari** — [@rohiththirunahari](https://github.com/indianicsoft)  

***

<div align="center">

If this project saved you time, consider giving it a ⭐ on GitHub.  
Pull requests, ideas, and prompt templates are always welcome.

</div>
