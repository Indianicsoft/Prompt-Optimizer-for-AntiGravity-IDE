// Client-side Gemini API Integration

export async function optimizePromptWithAI(rawPrompt, config) {
  const { apiKey, model = 'gemini-1.5-flash', template, preset, constraintsText, parsedData } = config;
  
  if (!apiKey) {
    throw new Error('Google Gemini API Key is missing. Please add it in Settings.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // Build the system prompt instruction
  const systemPrompt = `You are a Principal AI Developer Tools Architect.
Your task is to take a developer's raw, low-quality, vague coding prompt and transform it into a highly structured, precise, token-efficient, execution-ready prompt optimized for an AI Coding Assistant inside "AntiGravity IDE".

Role Framing: ${parsedData.role}
Task Mode: ${parsedData.mode}
Target Templates instructions:
${template.systemInstructions}
Structure to follow:
${template.format}

Style Preset styling guidelines:
${preset.formattingRules.join('\n')}

Constraints to inject:
${constraintsText || 'None specified.'}

Instructions for output:
1. Infer missing file targets, structural contexts, and security boundaries.
2. Remove verbose greetings and conversational noise.
3. Inject the specified constraints cleanly into a dedicated "Constraints" section.
4. Output your response ONLY as a JSON object matching this schema:
{
  "optimizedPrompt": "The fully compiled, structured prompt ready for copy-pasting",
  "explanation": [
    { "category": "String (e.g. Structure, Constraints, Clarity)", "detail": "What was adjusted and why" }
  ],
  "tags": ["Array of short tags matching technologies/contexts, max 4 items"]
}
Do NOT wrap the JSON in markdown code blocks like \`\`\`json. Return only the raw JSON.`;

  const payload = {
    contents: [
      {
        parts: [
          { text: systemPrompt },
          { text: `Raw developer input to optimize:\n"${rawPrompt}"` }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2
    }
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData.error?.message || `HTTP ${response.status}`;
      throw new Error(`Gemini API Error: ${errMsg}`);
    }

    const resData = await response.json();
    const resultText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!resultText) {
      throw new Error('Empty response received from Gemini API.');
    }

    // Parse the JSON output safely
    try {
      const cleanJson = resultText.replace(/^\`\`\`json\s*|\s*\`\`\`$/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (parseErr) {
      console.warn('Failed to parse Gemini output as JSON, attempting regex cleanup:', parseErr);
      // Fallback: extract JSON from string if model wrapped it in markdown
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('AI returned invalid JSON structure.');
    }
  } catch (e) {
    console.error('Gemini API request failed:', e);
    throw e;
  }
}
