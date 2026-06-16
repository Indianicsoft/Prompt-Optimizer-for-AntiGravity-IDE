// Model Style Presets Configurations

export const presetsRegistry = [
  {
    id: 'gemini-style',
    name: 'Gemini Style (Compact Structured)',
    description: 'Generates clean, dense, token-efficient prompts utilizing clear markdown headers and direct bullet points.',
    formattingRules: [
      'Write in a dense, declarative style with zero conversational fluff.',
      'Group parameters under clear markdown headers (### Role, ### Task, ### Constraints).',
      'Use bulleted lists for specific requirements to enable faster model parsing.'
    ]
  },
  {
    id: 'claude-style',
    name: 'Claude Style (XML Scoped Spec)',
    description: 'Structures prompts using explicit XML tag blocks (e.g. <context>, <instructions>) for strict instruction obedience.',
    formattingRules: [
      'Wrap structural components inside clear XML-style tags (e.g., <role>, <instructions>, <constraints>, <output_format>).',
      'Use highly detailed specifications, leaving no room for assumptions.',
      'Prompt the model to explain its reasoning in a <thinking> block before generating code.'
    ]
  },
  {
    id: 'safe-patch-style',
    name: 'Safe Patch Prompt',
    description: 'Constrains the AI to return code in exact search-and-replace block headers (ORIGINAL/MODIFIED) for automatic patching.',
    formattingRules: [
      'Format output using explicit ORIGINAL/MODIFIED markers.',
      'Specify that code modifications must target exact line scopes, preserving indentation.',
      'Warn the model that returning fully rewritten files instead of patches is strictly forbidden.'
    ]
  },
  {
    id: 'full-rewrite-style',
    name: 'Full Rewrite Prompt',
    description: 'Enforces the AI to return the complete code file with all imports and helpers, preventing truncated placeholders.',
    formattingRules: [
      'Demand that files must be written out completely from start to finish.',
      'Include a rule: "DO NOT use placeholders like // ... existing imports ... or // implement rest here."',
      'Ensure code is ready to copy-paste directly into a new or blank file.'
    ]
  },
  {
    id: 'browser-only-style',
    name: 'Browser-Only Strict',
    description: 'Forces vanilla browser APIs, script tags, local storage, and disables all Node modules and build bundlers.',
    formattingRules: [
      'Inject rules: "Do NOT use node require() or ES6 import statements unless pointing to public URLs/CDNs."',
      'Force all files to run locally when double-clicked (file:// protocol compatibility).',
      'Require saving data solely using LocalStorage, SessionStorage, or IndexedDB.'
    ]
  },
  {
    id: 'vanilla-js-style',
    name: 'Vanilla JS Only',
    description: 'Bans all modern web frameworks (React, Vue, Tailwind, Angular, Svelte) and enforces native HTML, CSS, and JS APIs.',
    formattingRules: [
      'Inject rules: "Do NOT use React, Vue, Angular, Svelte, Tailwind, or any external framework/library."',
      'Use only native browser APIs, vanilla CSS variables for layouts, and plain ES6+ JavaScript.',
      'Implement UI controls using semantic HTML elements and standard event listeners.'
    ]
  }
];
