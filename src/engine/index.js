// Central Optimization Engine Coordinator

import { parseRawPrompt } from './parser.js';
import { compressText } from './compressor.js';
import { templatesRegistry } from './templates.js';
import { presetsRegistry } from './presets.js';
import { getConstraintsText } from './constraints.js';
import { scorePrompt } from './scorer.js';
import { optimizePromptWithAI } from './ai.js';

// Map task mode strings to short, meaningful tag labels
const MODE_TAG_MAP = {
  'New app build': 'Greenfield',
  'Existing project bug fix': 'Bug Fix',
  'Existing project enhancement': 'Enhancement',
  'Refactor': 'Refactor',
  'UI redesign': 'UI/UX',
  'Firebase integration': 'Firebase',
  'AI / ML feature build': 'AI/ML',
  'Performance optimization': 'Performance',
  'Multi-file patch generation': 'Patch',
  'Prompt compression / token reduction': 'Compression'
};

export async function runOptimizationPipeline(rawPrompt, options = {}) {
  const {
    templateId = 'greenfield',
    presetId = 'gemini-style',
    activeConstraintIds = [],
    useAI = false,
    apiKey = '',
    model = 'gemini-1.5-flash'
  } = options;

  if (!rawPrompt || !rawPrompt.trim()) {
    throw new Error('Prompt text cannot be empty.');
  }

  // 1. Core Parsing of the raw input
  const parsedData = parseRawPrompt(rawPrompt);
  
  // 2. Fetch templates and presets configs
  const template = templatesRegistry.find(t => t.id === templateId) || templatesRegistry[0];
  const preset = presetsRegistry.find(p => p.id === presetId) || presetsRegistry[0];
  
  // 3. Compile constraint prompt text
  const constraintsText = getConstraintsText(activeConstraintIds);

  // 4. Score the RAW prompt first (before-optimization quality measurement)
  const rawScore = scorePrompt(rawPrompt, []);

  let optimizedPrompt = '';
  let explanation = [];

  // Build meaningful tags from mode map + detected technologies
  const modeTag = MODE_TAG_MAP[parsedData.mode] || parsedData.mode.split(' ').at(-1);
  let tags = [modeTag];
  if (parsedData.detectedTech.length > 0) {
    tags = [...tags, ...parsedData.detectedTech.slice(0, 3)];
  }

  if (useAI && apiKey) {
    // ---- AI-Powered Semantic Optimization ----
    try {
      const aiResult = await optimizePromptWithAI(rawPrompt, {
        apiKey,
        model,
        template,
        preset,
        constraintsText,
        parsedData
      });
      
      optimizedPrompt = aiResult.optimizedPrompt;
      explanation = aiResult.explanation;
      if (aiResult.tags && aiResult.tags.length > 0) {
        tags = Array.from(new Set([...tags, ...aiResult.tags]));
      }
    } catch (aiErr) {
      console.warn('AI Optimization failed. Falling back to Local Transformation Engine:', aiErr);
      // Fallback to local
      const localResult = runLocalTransformation(rawPrompt, {
        parsedData, template, preset, constraintsText, activeConstraintIds
      });
      optimizedPrompt = localResult.optimizedPrompt;
      explanation = [
        { category: 'Fallback', detail: 'AI request failed; fell back to offline local compiler rules.' },
        ...localResult.explanation
      ];
    }
  } else {
    // ---- Local Rule-Based Structure Compiler ----
    const localResult = runLocalTransformation(rawPrompt, {
      parsedData, template, preset, constraintsText, activeConstraintIds
    });
    optimizedPrompt = localResult.optimizedPrompt;
    explanation = localResult.explanation;
  }

  // 5. Score the OPTIMIZED output (after-optimization readiness measurement)
  const scoreBreakdown = scorePrompt(optimizedPrompt, activeConstraintIds);

  return {
    title: rawPrompt.trim().substring(0, 30) + (rawPrompt.length > 30 ? '...' : ''),
    rawPrompt,
    optimizedPrompt,
    mode: parsedData.mode,
    modelTarget: preset.name,
    constraints: activeConstraintIds,
    rawScore,        // Quality of user's original prompt
    scoreBreakdown,  // Readiness of the compiled output
    explanation,
    tags: [...new Set(tags)].slice(0, 4)
  };
}

// Build a preset-specific formatting suffix appended after core output
function getPresetSuffix(preset) {
  if (!preset || !preset.formattingRules || preset.formattingRules.length === 0) return '';
  
  switch (preset.id) {
    case 'safe-patch-style':
      return `\n\n# Patch Output Format\nRespond using ONLY search-and-replace blocks:\n\`\`\`diff\n<<<<<<< ORIGINAL\n[exact lines to match]\n=======\n[replacement lines]\n>>>>>>> MODIFIED\n\`\`\`\nDo NOT return fully rewritten files. Target only the exact changed lines.`;

    case 'full-rewrite-style':
      return `\n\n# Output Completeness Rule\nReturn the complete file contents from top to bottom — every import, every function, every export. DO NOT use placeholders like \`// ... existing code ...\` or \`// implement rest here\`. The output must be copy-paste ready.`;

    case 'browser-only-style':
      return `\n\n# Browser-Only Execution Rules\n- Do NOT use node require() or ES6 import statements except for public CDN URLs.\n- All code must run when double-clicked (file:// protocol compatible).\n- Save data using LocalStorage, SessionStorage, or IndexedDB only. No server-side calls.`;

    case 'vanilla-js-style':
      return `\n\n# Vanilla JS Execution Rules\n- Do NOT use React, Vue, Angular, Svelte, Tailwind, or any external framework.\n- Use only native browser APIs, vanilla CSS, and plain ES6+ JavaScript.\n- Use semantic HTML elements and standard DOM event listeners only.`;

    case 'claude-style':
    case 'gemini-style':
    default:
      return ''; // These are already handled by the format branch choice
  }
}

// Local Structural Compiler logic
function runLocalTransformation(rawPrompt, config) {
  const { parsedData, template, preset, constraintsText, activeConstraintIds } = config;
  
  const compressedInput = compressText(rawPrompt);
  const explanation = [];

  // Base transformations
  explanation.push({ category: 'Role', detail: `Injected developer persona: "${parsedData.role}".` });
  
  if (compressedInput.length < rawPrompt.length) {
    explanation.push({ 
      category: 'Compression', 
      detail: `Strips greetings/fluff, saving approximately ${Math.round((rawPrompt.length - compressedInput.length) / 4)} tokens.` 
    });
  }

  if (activeConstraintIds.length > 0) {
    explanation.push({ category: 'Constraints', detail: `Injected ${activeConstraintIds.length} strict boundaries.` });
  }

  explanation.push({ category: 'Structure', detail: `Enforced structure layout matching: "${template.name}".` });
  
  if (preset.id !== 'gemini-style' && preset.id !== 'claude-style') {
    explanation.push({ category: 'Preset', detail: `Applied "${preset.name}" output format rules.` });
  }

  // Format Assembly
  let formattedPrompt = '';
  const presetSuffix = getPresetSuffix(preset);
  
  if (preset.id === 'claude-style') {
    // XML Structured format
    formattedPrompt = `<role>
${parsedData.role}
</role>

<context>
Goal category: ${parsedData.mode}
Target Tech: ${parsedData.detectedTech.join(', ') || 'Vanilla web APIs'}
Target Files: ${parsedData.files.map(f => `\`${f}\``).join(', ') || 'Not specified'}
</context>

<instructions>
${template.systemInstructions}
Core Task:
${compressedInput}
</instructions>`;

    if (constraintsText) {
      formattedPrompt += `\n\n<constraints>\n${constraintsText}\n</constraints>`;
    }

    formattedPrompt += `\n\n<output_format>
Your response must align with this layout structure:
${template.format}
</output_format>`;

  } else {
    // Gemini-style markdown format (default for all other presets)
    formattedPrompt = `# Role
${parsedData.role}

# Context & Scope
- **Task Mode**: ${parsedData.mode}
- **Technologies**: ${parsedData.detectedTech.join(', ') || 'Vanilla web APIs'}
- **Target Files**: ${parsedData.files.map(f => `\`${f}\``).join(', ') || 'Not specified'}

# System Instructions
${template.systemInstructions}

# Core Task Requirements
${compressedInput}`;

    if (constraintsText) {
      formattedPrompt += `\n\n# Constraints & Execution Rules\n${constraintsText}`;
    }

    formattedPrompt += `\n\n# Expected Output Format
Deliver your response exactly in this structure:
${template.format}`;
  }

  // Append preset-specific formatting rules for non-standard presets
  if (presetSuffix) {
    formattedPrompt += presetSuffix;
  }

  return {
    optimizedPrompt: formattedPrompt,
    explanation
  };
}
