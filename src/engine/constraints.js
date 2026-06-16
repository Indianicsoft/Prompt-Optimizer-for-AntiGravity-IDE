// Constraints Builder Configuration

export const constraintsRegistry = [
  {
    id: 'no-frameworks',
    name: 'No Frameworks',
    description: 'Bans React, Vue, Angular, etc. Use native HTML/CSS/JS only.',
    promptText: 'Do NOT use external frameworks (such as React, Vue, Angular, Svelte).'
  },
  {
    id: 'no-libraries',
    name: 'No Libraries',
    description: 'Avoid importing external npm packages or JS utilities.',
    promptText: 'Do NOT introduce external utility libraries (such as Lodash, jQuery, Axios, TailwindCSS).'
  },
  {
    id: 'browser-only',
    name: 'Browser-Only APIs',
    description: 'Restricts code to client-side DOM APIs; forbids Node.js filesystem and server imports.',
    promptText: 'Limit operations to client-side browser APIs. Ensure compatibility with a local web environment.'
  },
  {
    id: 'no-node',
    name: 'No Node.js Modules',
    description: 'Prevents importing node built-ins like fs, path, child_process.',
    promptText: 'Do NOT use Node.js backend-only packages or modules (e.g. fs, path, os, express).'
  },
  {
    id: 'firebase-only',
    name: 'Firebase Only',
    description: 'Forces database, storage, and authentication to use Firebase Web SDK.',
    promptText: 'Implement Auth and Cloud persistence exclusively using the Firebase Web SDK.'
  },
  {
    id: 'vanilla-js',
    name: 'Vanilla JS Only',
    description: 'Enforces plain JavaScript without bundlers or TypeScript compilations.',
    promptText: 'Write only clean, vanilla ES6+ JavaScript. No TS compilation or bundlers required.'
  },
  {
    id: 'single-file',
    name: 'Single-File Output',
    description: 'Forces all code to reside in a single index.html file.',
    promptText: 'Output all code in a single self-contained HTML file (incorporating style and script tags).'
  },
  {
    id: 'three-file',
    name: 'Max 3 Files',
    description: 'Limits project architecture to index.html, styles.css, and app.js.',
    promptText: 'Structure the codebase into a maximum of 3 core files: index.html, styles.css, and app.js.'
  },
  {
    id: 'mobile-first',
    name: 'Mobile-First UI',
    description: 'Enforces CSS media queries and layouts built primarily for mobile viewport widths.',
    promptText: 'Adopt a mobile-first responsive styling methodology, with inputs scaled for touchscreen targets.'
  },
  {
    id: 'no-rewrite-unrelated',
    name: 'Do Not Rewrite Unrelated Code',
    description: 'Forces editing only targeted regions to save context.',
    promptText: 'Strictly avoid rewriting or modifying functions and variables that are unrelated to the target task.'
  },
  {
    id: 'analyze-first',
    name: 'Analyze Files First',
    description: 'Requires the model to check existing project structures before editing.',
    promptText: 'Always read and analyze the existing file contexts and project structure before writing code.'
  },
  {
    id: 'plan-first',
    name: 'Output Plan Before Code',
    description: 'Forces writing a markdown roadmap first, waiting for confirmation.',
    promptText: 'Output a comprehensive technical implementation plan first and halt. Wait for explicit approval before outputting code.'
  },
  {
    id: 'token-efficient',
    name: 'Token-Efficient Content',
    description: 'Directs the model to strip comments and explanations, keeping it concise.',
    promptText: 'Keep output highly token-efficient. Remove conversational preamble, repetitive explanations, and excessive comments.'
  }
];

export function getConstraintsText(activeIds) {
  return activeIds
    .map(id => {
      const item = constraintsRegistry.find(c => c.id === id);
      return item ? `- ${item.promptText}` : null;
    })
    .filter(Boolean)
    .join('\n');
}
