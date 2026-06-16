# Prompt Optimizer for AntiGravity IDE

Prompt Optimizer for AntiGravity IDE is an open-source developer tool that transforms rough coding prompts into structured, token-efficient, execution-ready prompts for AntiGravity workflows.[1]

## Overview

This project helps developers improve prompt clarity, structure, output control, and execution readiness for software-building tasks, reflecting current best practices for healthy, contributor-friendly repositories on GitHub.[1][2]

The product is designed for prompt transformation, template-based optimization, prompt versioning, scoring, and export. A live demo, screenshots, and contribution workflow should be included in the repository because clear documentation and onboarding materially improve open-source adoption.[1][3]

## Core Features

- Raw prompt to optimized prompt transformation.
- Task-type detection for build, bug-fix, enhancement, refactor, UI redesign, Firebase integration, AI or ML feature work, performance optimization, and patch generation.
- Prompt template engine with reusable structured presets.
- Constraint builder for browser-only, no-framework, vanilla JS, safe patching, and similar rules.
- Prompt scoring for clarity, specificity, ambiguity risk, completeness, and execution readiness.
- Versioning, save flow, compare mode, and export as text, Markdown, or JSON.

## Tech Stack

- Frontend: JavaScript or TypeScript web app.
- Backend and persistence: Firebase Auth and Firestore.
- Data-driven prompt templates, presets, scoring rules, and transformation passes.
- GitHub-friendly modular structure for templates, engines, and contribution workflows.

## Repository Structure

```text
prompt-optimizer-antigravity/
├── app/
├── components/
├── modules/
│   ├── intent-parser/
│   ├── classifier/
│   ├── constraint-engine/
│   ├── template-engine/
│   ├── scoring-engine/
│   └── explain-engine/
├── services/
│   ├── firebase/
│   └── storage/
├── data/
│   ├── templates/
│   ├── presets/
│   └── rules/
├── public/
├── screenshots/
├── docs/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   ├── workflows/
│   ├── CODEOWNERS
│   └── pull_request_template.md
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
└── CHANGELOG.md
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/prompt-optimizer-antigravity.git
cd prompt-optimizer-antigravity
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Firebase

Create a local environment file and add the Firebase project values required by the app.

```bash
cp .env.example .env.local
```

Add values similar to:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Run locally

```bash
npm run dev
```

## Firebase Collections

Suggested Firestore collections:

- `users`
- `prompts`
- `promptVersions`
- `templates`
- `presets`
- `usageStats`

Each prompt record should support fields such as:

- `id`
- `title`
- `rawPrompt`
- `optimizedPrompt`
- `mode`
- `modelTarget`
- `constraints`
- `scoreBreakdown`
- `explanation`
- `tags`
- `createdAt`
- `updatedAt`
- `versionNumber`

## Open Source Setup

A public repository should include a README, license, and contribution guidance so users and contributors can clearly understand project purpose, permissions, and participation rules.[1][4][2]

Recommended repository settings:

- Add a short repository description.
- Add relevant topics so the project is easier to discover on GitHub.[5][6]
- Add a social preview image for better sharing previews.[7]
- Enable Issues, Discussions, and Projects if community collaboration is a goal.[5]
- Protect the default branch and require pull requests for changes to `main`.[8]

## Contributing

Contributions are welcome. Before opening a pull request:

1. Read `CONTRIBUTING.md`.
2. Search for existing issues.
3. Open an issue for substantial feature proposals.
4. Keep pull requests focused and easy to review.

## Roadmap

- v0.1.0: MVP optimizer workspace, templates, scoring, save flow, export.
- v0.2.0: Version comparison, richer explanation engine, improved template presets.
- v1.0.0: Stable public release with polished docs, hosted demo, and contributor tooling.

## License

This project is licensed under the MIT License. A license is important because open-source permissions should be explicit rather than assumed.[4][9]
