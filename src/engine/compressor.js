// Token Reduction & Prompt Text Compressor

const FILLER_WORDS = [
  /\bplease\b/gi,
  /\bcan you\b/gi,
  /\bcould you\b/gi,
  /\bwould you mind\b/gi,
  /\bi was wondering if\b/gi,
  /\bhi there\b/gi,
  /\bhello\b/gi,
  /\bhey\b/gi,
  /\bi want to\b/gi,
  /\bi need to\b/gi,
  /\bi need a\b/gi,
  /\bi would like to\b/gi,
  /\bi am trying to\b/gi,
  /\bit would be great if you could\b/gi,
  /\bthank you\b/gi,
  /\bthanks\b/gi,
  /\bkindly\b/gi,
  /\bwrite a code for\b/gi,
  /\bwrite a program that\b/gi,
  /\bcode a\b/gi,
  /\bcreate a function to\b/gi,
  /\bso that it will\b/gi
  // NOTE: 'just', 'actually', 'basically' removed — these can carry meaning
  // in developer instructions (e.g. "don't actually parse HTML")
];

const PHRASE_REPLACEMENTS = [
  { pattern: /\bin order to\b/gi, replacement: 'to' },
  { pattern: /\bfor the purpose of\b/gi, replacement: 'to' },
  { pattern: /\bmake sure that it has\b/gi, replacement: 'include' },
  { pattern: /\bat the end of the day\b/gi, replacement: 'ultimately' },
  { pattern: /\bhas the ability to\b/gi, replacement: 'can' },
  { pattern: /\ba set of\b/gi, replacement: 'multiple' },
  { pattern: /\bwith respect to\b/gi, replacement: 'about' },
  { pattern: /\bdue to the fact that\b/gi, replacement: 'because' },
  { pattern: /\bin the event that\b/gi, replacement: 'if' },
  { pattern: /\butilize\b/gi, replacement: 'use' },
  { pattern: /\bcomponents and files\b/gi, replacement: 'files' },
  { pattern: /\bas fast as possible\b/gi, replacement: 'efficiently' },
  { pattern: /\bdo not forget to\b/gi, replacement: 'must' }
];

export function compressText(text) {
  if (!text) return '';
  
  let compressed = text;

  // 1. Apply phrase replacements
  PHRASE_REPLACEMENTS.forEach(pair => {
    compressed = compressed.replace(pair.pattern, pair.replacement);
  });

  // 2. Remove filler words
  FILLER_WORDS.forEach(regex => {
    compressed = compressed.replace(regex, '');
  });

  // 3. Remove leading conversational greetings or introductions (e.g. "I am building...")
  compressed = compressed.replace(/^[\s,;.]*(hi|hello|hey|greetings|dear AI)[\s,;.]*/i, '');

  // 4. Normalize multiple whitespaces and line breaks
  compressed = compressed.replace(/[ \t]+/g, ' '); // Compress spaces
  compressed = compressed.replace(/\n\s*\n\s*\n+/g, '\n\n'); // Max 2 consecutive newlines
  
  // 5. Clean up loose punctuation created by deletions
  compressed = compressed.replace(/^[ \t\n,;.-]+/g, ''); // Trim leading punctuation
  compressed = compressed.trim();

  // If compression made it empty (e.g., prompt was just "please"), revert to original
  if (!compressed) return text;

  return compressed;
}

export function estimateTokens(text) {
  if (!text) return 0;
  // Standard heuristic: 1 token is roughly 4 characters in English, or ~0.75 words.
  // We use characters / 4 for standard conservative token estimation.
  return Math.ceil(text.length / 4);
}

export function getCompressionStats(original, compressed) {
  const origTokens = estimateTokens(original);
  const compTokens = estimateTokens(compressed);
  const diff = origTokens - compTokens;
  const percent = origTokens > 0 ? Math.round((diff / origTokens) * 100) : 0;

  return {
    originalTokens: origTokens,
    compressedTokens: compTokens,
    tokensSaved: Math.max(0, diff),
    percentSaved: Math.max(0, percent)
  };
}
