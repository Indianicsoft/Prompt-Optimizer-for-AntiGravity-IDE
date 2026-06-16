# Contributing to Prompt Optimizer for AntiGravity IDE

Thank you for taking the time to contribute. This project is designed so that contributions are modular and focused — you can add a new prompt template, a scoring rule, or a model preset without needing to understand the whole codebase.

***

## Ways to Contribute

The easiest entry points are:

- **Add a new prompt template** — add a JSON file to `data/templates/`
- **Add a new model style preset** — add a config file to `data/presets/`
- **Improve scoring rules** — edit or add rules in `data/rules/`
- **Fix a bug** — pick an issue labeled `bug` and submit a fix
- **Improve UI** — issues labeled `ui` cover design improvements
- **Improve docs** — fix README, add examples, improve docstrings
- **Report an issue** — open a detailed bug report or feature request

***

## Local Setup

### Prerequisites

- Node.js (for Firebase CLI)
- A Firebase project (free tier is fine)
- Any code editor

### Steps

```bash
# 1. Fork the repo on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/prompt-optimizer-antigravity.git
cd prompt-optimizer-antigravity

# 3. Install Firebase CLI
npm install -g firebase-tools
firebase login

# 4. Add your Firebase config
# Copy services/firebase/config.example.js → services/firebase/config.js
# Fill in your own Firebase project credentials

# 5. Run locally
firebase serve

# Or just open index.html directly for UI testing without auth
```

***

## Branch Naming

| Type | Format | Example |
|------|--------|---------|
| Bug fix | `fix/short-description` | `fix/score-panel-null` |
| New feature | `feat/short-description` | `feat/version-compare` |
| New template | `template/template-name` | `template/firebase-crud` |
| New preset | `preset/model-name` | `preset/gemini-ultra` |
| Docs | `docs/section-name` | `docs/setup-guide` |
| UI change | `ui/component-name` | `ui/optimizer-workspace` |

***

## Commit Message Style

Use short, clear commit messages:

```
fix: null score when prompt is empty
feat: add version comparison view
template: add firebase-auth-admin template
docs: improve setup instructions
ui: polish optimizer workspace layout
```

***

## Adding a Prompt Template

All templates live in `data/templates/`. Each template is a `.json` file.

### Template format

```json
{
  "id": "firebase-crud-app",
  "name": "Firebase CRUD App",
  "description": "Greenfield Firebase-backed CRUD app with auth, Firestore, and admin panel.",
  "mode": "new-build",
  "targetModel": "gemini-compact",
  "constraints": [
    "browser-only",
    "vanilla-js",
    "firebase-only",
    "no-frameworks"
  ],
  "sections": {
    "role": "Senior full-stack web developer. Browser-only. No frameworks. No Node.js.",
    "task": "Build a complete CRUD web application using Firebase Auth and Firestore.",
    "outputTargets": ["index.html", "style.css", "app.js", "firebase.js"],
    "constraints": [
      "Browser-only. No Node.js.",
      "No external libraries.",
      "Use Firebase Auth for authentication.",
      "Use Firestore for all data.",
      "Guard all private routes with auth check."
    ],
    "planFirst": true,
    "verificationChecklist": [
      "Auth flow works",
      "CRUD operations complete",
      "Error states handled",
      "Responsive layout"
    ]
  },
  "tags": ["firebase", "crud", "vanilla-js", "browser-only"],
  "author": "your-github-username",
  "version": "1.0.0"
}
```

***

## Adding a Scoring Rule

Scoring rules live in `data/rules/scoring.json`. Each rule has an id, a check type, a condition, and a score delta.

```json
{
  "id": "has-role-definition",
  "label": "Role Definition",
  "checkType": "contains-pattern",
  "condition": "ROLE:|Role:|You are a",
  "scoreDelta": 10,
  "maxScore": 10,
  "explanation": "Prompts with an explicit role definition get more consistent model output."
}
```

***

## Pull Request Checklist

Before submitting a PR, confirm:

- [ ] The app still runs locally without errors
- [ ] No unrelated files were changed
- [ ] Commit messages are clear and follow the style guide
- [ ] If adding a template — it follows the correct JSON schema
- [ ] If adding a UI feature — tested at desktop and mobile
- [ ] If fixing a bug — the fix is targeted and does not regress other features
- [ ] Documentation updated if behavior changed

***

## Code Style

- Use clear, readable variable and function names
- No dead code or commented-out blocks
- No `console.log` in production paths
- Keep files focused — one responsibility per module
- Prefer clarity over cleverness

***

## Need Help?

Open an issue with the label `question` or start a GitHub Discussion. All skill levels are welcome.
