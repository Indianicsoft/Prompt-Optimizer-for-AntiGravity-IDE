# Prompt Optimizer for AntiGravity IDE

Prompt Optimizer is a specialized developer tool to convert raw, vague, low-quality coding prompts into structured, token-efficient, execution-ready specifications designed for AI coding assistants inside **AntiGravity IDE**.

It works 100% locally out-of-the-box using rules-based transformers, parsers, and compilers (local sandbox mode), but can be upgraded to an AI-powered semantic optimizer by supplying a Google Gemini API Key.

---

## Key Features

1. **Structured Compiling Pipeline**: Automatically injects role framing, context mapping, active targets, rules, and explicit formats.
2. **Task Type Classifier**: Automatically identifies if the instruction represents a greenfield build, fix, refactor, UI redesign, or Firebase integration.
3. **Scenario Scaffolding Engine**: Choose from pre-configured scaffolding models like Greenfield full builds, Safe patches, Plan-first roadmaps, and more.
4. **Model Style Presets**: Styles output formatting matching Gemini-style compact markdowns, Claude-style XML tags, or strict vanilla files.
5. **Quality Scoring Audit**: Numeric score breakdowns (0-100) evaluating Clarity, Specificity, Completeness, Ambiguity risks, Output boundaries, and Token efficiency.
6. **Unified Version History**: Creates new versions automatically on saves with modified raw text, and renders line-by-line colored git-style diffs side-by-side.
7. **Export Options**: Quickly copy to clipboard, or export compiled prompts as `.TXT`, `.MD` (Markdown), or `.JSON` files.
8. **Double Storage Synchronization**: Work offline inside the LocalStorage sandbox, or connect your Firebase Project in Settings to sync profiles, prompts, and history logs to Firestore.

---

## File Directory Map

```
prompt-optimizer-antigravity/
├── index.html                   # Core layout shell & fonts loader
├── package.json                 # Node package configuration
├── vite.config.js               # Dev server configuration
├── src/
│   ├── main.js                  # Application bootstrapper & dynamic router
│   ├── index.css                # Global theme tokens, cards, and animations
│   ├── core/
│   │   ├── state.js             # Reactive PubSub global store
│   │   ├── storage.js           # Offline LocalStorage database & mock seeding
│   │   └── firebase.js          # Dynamic Cloud Firestore & Auth connectors
│   ├── engine/
│   │   ├── index.js             # central pipeline compiler coordinator
│   │   ├── parser.js            # Regex-based intent, role, and file extractor
│   │   ├── compressor.js        # Token-compression & heuristic counter
│   │   ├── templates.js         # Scaffolding template registry
│   │   ├── presets.js           # Target model style presets
│   │   ├── constraints.js       # Toggle constraints registry & injectors
│   │   ├── scorer.js            # Metric score checker & tips generator
│   │   └── ai.js                # Direct Gemini API integration module
│   ├── components/
│   │   ├── AppShell.js          # Main layout shell with sidebar links
│   │   ├── ScoreIndicator.js    # Radial SVG score gauges
│   │   ├── DiffViewer.js        # Color coded side-by-side diff generator
│   │   └── Toast.js             # Overlay notification toasts
│   └── views/
│       ├── LandingView.js       # Welcome landing page
│       ├── AuthView.js          # Firebase Sign-In & Sign-Up panel
│       ├── DashboardView.js     # User statistics dashboard
│       ├── OptimizerView.js     # Workspace editor, toggles, and results
│       ├── TemplatesView.js     # Scaffolds catalog browser
│       ├── SavedPromptsView.js  # Saved list & version comparison panel
│       └── SettingsView.js      # Credentials & Firebase configuration
```

---

## Getting Started

### Prerequisites
Make sure you have Node.js and npm installed.

### Installation
Clone this repository and install dependencies:
```bash
cd prompt-optimizer-antigravity
npm install
```

### Running Locally (Vite Dev Server)
Boot the dev server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Integration Setup

### Enable AI-Powered Semantic Refinement
1. Open the application.
2. Navigate to **Settings** in the sidebar.
3. Paste your Google Gemini API Key and toggle **Enable AI Optimizations**.

### Connect Firebase Cloud Sync
1. Create a project in [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** (Email/Password provider) and **Cloud Firestore**.
3. Copy the client configuration object parameters.
4. Paste the credentials into the **Firebase Configuration Form** inside **Settings**.
5. Once initialized, click **Sign In / Sync Cloud** in the sidebar to create accounts and back up data automatically.

---

## Contributor Customization Guidelines

The Prompt Optimizer is architected to make adding new rules, formats, and checks simple for open-source contributors:

### 1. Adding a new Task Template
Add a new template object to the `templatesRegistry` array inside `src/engine/templates.js`:
```javascript
{
  id: 'my-custom-template',
  name: 'Custom Template Name',
  description: 'Explain what this template does...',
  systemInstructions: 'System instructions telling the AI what details to target...',
  format: 'The structural format outline expected (e.g. ### 1. Goal ...)'
}
```

### 2. Adding a new Style Preset
Add a new style preset object to the `presetsRegistry` array inside `src/engine/presets.js`:
```javascript
{
  id: 'new-model-style',
  name: 'Custom Model Style',
  description: 'Style description...',
  formattingRules: [
    'Rule 1 for output styling...',
    'Rule 2...'
  ]
}
```

### 3. Adding a new Constraint Toggle
Add a new constraint object to the `constraintsRegistry` array inside `src/engine/constraints.js`:
```javascript
{
  id: 'custom-constraint-id',
  name: 'Custom Constraint Label',
  description: 'Short helper text visible on hover...',
  promptText: 'Specific instruction injected into constraints section...'
}
```

### 4. Adjusting Scoring Metrics
Add custom regex or character checks inside the `scorePrompt` evaluation loop in `src/engine/scorer.js`. Add corresponding tips to the `recommendations` array.

---

## License
Licensed under the [MIT License](LICENSE).
