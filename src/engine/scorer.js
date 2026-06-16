// Internal Prompt Quality Scoring Engine

export function scorePrompt(promptText, activeConstraints = []) {
  const text = promptText || '';
  const textLower = text.toLowerCase();
  
  let clarity = 100;
  let specificity = 100;
  let completeness = 100;
  let ambiguityRisk = 100;
  let outputControl = 100;
  let tokenEfficiency = 100;

  const recommendations = [];

  // 1. Clarity Assessment
  // Check for vague phrases
  const vaguePhrases = [
    { pattern: /\b(somehow|do something|make it work|fix it|make it better|adjust it|clean up a bit)\b/gi, tip: 'Define exact code actions instead of vague phrases like "make it work".' },
    { pattern: /\b(nice|beautiful|amazing|fancy|good UI)\b/gi, tip: 'Specify concrete styling guidelines (e.g. glassmorphic, 16px padding) rather than subjective adjectives like "nice UI".' },
    { pattern: /\b(it|them|things|stuff)\b/gi, tip: 'Use explicit nouns (e.g., "the modal window", "the user object") instead of pronouns like "it" or "them".' }
  ];

  let vagueCount = 0;
  vaguePhrases.forEach(item => {
    const matches = text.match(item.pattern);
    if (matches) {
      vagueCount += matches.length;
      clarity -= Math.min(15, matches.length * 5);
      if (!recommendations.includes(item.tip)) {
        recommendations.push(item.tip);
      }
    }
  });
  
  if (text.length < 15) {
    clarity -= 40;
    recommendations.push('Add more detail. A prompt under 15 characters lacks essential instructions.');
  }
  clarity = Math.max(20, clarity);

  // 2. Specificity Assessment
  // Check if standard technologies, variables, functions, or file targets are mentioned
  const techMatches = text.match(/\b(react|vue|js|javascript|html|css|firebase|firestore|sql|database|api|json|node|express|python|flask|django|git|diff|patch|npm|bash)\b/gi);
  if (!techMatches) {
    specificity -= 40;
    recommendations.push('Specify the programming language, framework, or technology environment (e.g., React, Vanilla CSS).');
  } else if (techMatches.length < 2) {
    specificity -= 20;
    recommendations.push('Mention specific APIs, libraries, or dependencies used in the project.');
  }

  // Check for file references
  const fileMatches = text.match(/`([^`\s]+\.[a-zA-Z0-9]{2,4})`|([\w\-_\.]+\.[a-zA-Z0-9]{2,4})/g);
  if (!fileMatches) {
    specificity -= 30;
    recommendations.push('Reference specific file targets (e.g. `index.css`, `AuthView.js`) to restrict the scope of changes.');
  }
  specificity = Math.max(20, specificity);

  // 3. Completeness Assessment
  // Check for structural components: Role, Context/Goals, Task, Format
  const hasRole = textLower.match(/\b(role|you are a|act as|senior|architect|developer|designer|specialist)\b/i);
  const hasTask = textLower.match(/\b(task|goal|objective|instruction|requirement|do the following|implement|fix|refactor|design)\b/i);
  const hasFormat = textLower.match(/\b(format|output|structure|return|markdown|diff|patch|code block|yaml|xml)\b/i);

  if (!hasRole) {
    completeness -= 30;
    recommendations.push('Establish a clear persona or Role (e.g., "You are an accessibility specialist") to frame the AI response.');
  }
  if (!hasTask) {
    completeness -= 30;
    recommendations.push('Clearly state the main Task or goal of the prompt under a dedicated section.');
  }
  if (!hasFormat) {
    completeness -= 20;
    recommendations.push('Provide output formatting rules (e.g., "Return code as a unified git diff block").');
  }
  completeness = Math.max(20, completeness);

  // 4. Ambiguity Risk
  // Check for qualifiers that invite assumptions
  const ambiguityPhrases = [
    { pattern: /\b(etc|and so on|and stuff|similar things)\b/gi, tip: 'Avoid "etc" or "and so on". Explicitly enumerate all items or state that only the specified items are allowed.' },
    { pattern: /\b(maybe|perhaps|probably|might|if you want|if possible|optional)\b/gi, tip: 'Remove optional or conditional phrasing like "maybe" or "if you want" to enforce strict requirements.' },
    { pattern: /\b(should|would be nice|ideally)\b/gi, tip: 'Use strong imperative verbs ("must", "shall", "do not") instead of suggestive ones like "should".' }
  ];

  let ambiguityCount = 0;
  ambiguityPhrases.forEach(item => {
    const matches = text.match(item.pattern);
    if (matches) {
      ambiguityCount += matches.length;
      ambiguityRisk -= Math.min(20, matches.length * 8);
      if (!recommendations.includes(item.tip)) {
        recommendations.push(item.tip);
      }
    }
  });
  ambiguityRisk = Math.max(20, ambiguityRisk);

  // 5. Output Control
  // Check if user specifies strict formatting boundaries, no explanations, etc.
  const hasOutputBoundary = textLower.match(/\b(no explanation|only return|strictly code|return only|without explanation|markdown block|do not talk)\b/i);
  if (!hasOutputBoundary) {
    outputControl -= 40;
    recommendations.push('Inject output bounds such as "Do not provide conversational preamble, return only code blocks".');
  }
  outputControl = Math.max(30, outputControl);

  // 6. Token Efficiency
  // Check for conversational noise
  const conversationalNoise = [
    /\b(please|thank you|thanks|can you|could you|would you mind|i was wondering if|hi|hello)\b/gi
  ];
  let noiseCount = 0;
  conversationalNoise.forEach(regex => {
    const matches = text.match(regex);
    if (matches) {
      noiseCount += matches.length;
    }
  });

  if (noiseCount > 2) {
    tokenEfficiency -= Math.min(40, noiseCount * 10);
    recommendations.push('Compress the prompt by removing polite greetings, conversational filler, and preamble.');
  }
  if (text.length > 1500 && !textLower.includes('compress') && !textLower.includes('token')) {
    tokenEfficiency -= 20;
    recommendations.push('Prompt is very verbose. Apply compression transforms to stay within the model context window efficiently.');
  }
  tokenEfficiency = Math.max(30, tokenEfficiency);

  // Calculate constraint coverage
  let constraintsScore = 60;
  if (activeConstraints.length > 0) {
    constraintsScore = Math.min(100, 60 + activeConstraints.length * 15);
  } else {
    recommendations.push('Use the Constraint Builder to toggle and inject environment constraints (e.g. "No Node.js").');
  }

  // Calculate overall Execution Readiness (Total Score)
  const total = Math.round(
    (clarity + specificity + completeness + ambiguityRisk + constraintsScore + outputControl + tokenEfficiency) / 7
  );

  return {
    clarity,
    specificity,
    completeness,
    ambiguityRisk,
    constraints: constraintsScore,
    outputControl,
    tokenEfficiency,
    total,
    recommendations: recommendations.slice(0, 5) // Return top 5 actionable suggestions
  };
}
