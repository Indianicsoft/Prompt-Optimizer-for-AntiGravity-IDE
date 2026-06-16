// Regex-based Intent & File target parser

export function parseRawPrompt(rawPrompt) {
  const text = rawPrompt || '';
  
  // 1. Task Mode Classification
  let mode = 'New app build'; // Default
  const textLower = text.toLowerCase();
  
  if (textLower.match(/\b(bug|fix|error|broken|fails|fails to|incorrect|crash|issue|uncaught|nullpointer|debugging)\b/)) {
    mode = 'Existing project bug fix';
  } else if (textLower.match(/\b(add feature|enhance|extend|support for|integrate|new feature|allow user to)\b/)) {
    mode = 'Existing project enhancement';
  } else if (textLower.match(/\b(refactor|cleanup|simplify|restructure|clean up|dry|optimize code)\b/)) {
    mode = 'Refactor';
  } else if (textLower.match(/\b(ui|design|css|layout|glassmorphic|dark mode|theme|color|beautify|redesign|responsive)\b/)) {
    mode = 'UI redesign';
  } else if (textLower.match(/\b(firebase|firestore|cloud store|firestore rules|realtime database)\b/)) {
    mode = 'Firebase integration';
  } else if (textLower.match(/\b(gemini|claude|openai|llm|inference|ai model|gpt|agent|langchain)\b/)) {
    mode = 'AI / ML feature build';
  } else if (textLower.match(/\b(slow|performance|lcp|inp|optimize speed|fast|speed up|memory leak|bottleneck)\b/)) {
    mode = 'Performance optimization';
  } else if (textLower.match(/\b(patch|diff|git diff|patchfile)\b/)) {
    mode = 'Multi-file patch generation';
  } else if (textLower.match(/\b(compress|shorten|token|token reduction|compactify)\b/)) {
    mode = 'Prompt compression / token reduction';
  } else if (textLower.match(/\b(create new|bootstrap|build a new|start from scratch|greenfield|make an? app|make a website)\b/)) {
    mode = 'New app build';
  }

  // 2. Extract File Targets (e.g. `index.js`, `style.css`, app.py)
  // Look for strings enclosed in backticks or with common code extensions
  const fileRegex = /`([^`\s]+\.[a-zA-Z0-9]{2,4})`|([\w\-_\.\/]+\.[a-zA-Z0-9]{2,4})/g;
  const filesSet = new Set();
  let match;
  while ((match = fileRegex.exec(text)) !== null) {
    const file = match[1] || match[2];
    // Filter out common false positives (like version numbers '1.0.0')
    if (file && !file.match(/^\d+\.\d+\.\d+$/) && !file.includes('http://') && !file.includes('https://')) {
      filesSet.add(file);
    }
  }
  const files = Array.from(filesSet);

  // 3. Infer Developer Role
  let role = 'Senior Full-Stack Engineer';
  if (mode === 'UI redesign' || textLower.match(/\b(css|html|sass|frontend|button|flexbox|grid|colors)\b/)) {
    role = 'Lead Frontend UI/UX Engineer';
  } else if (mode === 'Firebase integration' || textLower.match(/\b(database|firestore|sql|schema|postgres|backend|mongodb)\b/)) {
    role = 'Senior Cloud Database Architect';
  } else if (textLower.match(/\b(react|vue|angular|svelte|components)\b/)) {
    role = 'Senior Frontend Engineer (React/Frameworks)';
  } else if (textLower.match(/\b(performance|memory|leak|speed|profiler|optimize|cache)\b/)) {
    role = 'Senior Performance & Systems Engineer';
  } else if (textLower.match(/\b(secure|security|auth|jwt|oauth|cryptography|cors|csrf)\b/)) {
    role = 'Senior Security Architect';
  }

  // 4. Extract technologies/keywords
  const techKeywords = ['react', 'vue', 'angular', 'svelte', 'tailwind', 'bootstrap', 'firebase', 'firestore', 'nodejs', 'express', 'python', 'django', 'fastapi', 'typescript', 'javascript', 'sqlite', 'mongodb', 'docker', 'gemini', 'openai'];
  const detectedTech = [];
  techKeywords.forEach(tech => {
    if (textLower.includes(tech)) {
      detectedTech.push(tech.charAt(0).toUpperCase() + tech.slice(1));
    }
  });

  return {
    mode,
    files,
    role,
    detectedTech,
    hasFileTargets: files.length > 0
  };
}
