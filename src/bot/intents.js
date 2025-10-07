import { callClaude } from '../services/claude.js';

async function recognizeIntent(message) {
  var prompt = `You are an intent classifier for a cybersecurity alert bot.

User message: "${message}"

Classify the intent and extract entities. Return ONLY valid JSON:

{
  "intent": "ADD_TAGS|REMOVE_TAGS|LIST_TAGS|ADD_FEED|SHOW_STATS|RUN_UPDATE|HELP|UNKNOWN",
  "entities": {
    "tags": ["tag1", "tag2"],
    "url": "https://..."
  }
}

Rules:
- ADD_TAGS: user wants to add software/device tags
- REMOVE_TAGS: user wants to remove tags
- LIST_TAGS: user wants to see their tags
- ADD_FEED: user wants to add an RSS feed URL
- SHOW_STATS: user wants to see system stats
- RUN_UPDATE: user wants to trigger manual update
- HELP: user needs help
- Extract tags as lowercase, trimmed strings
- Extract full URL if present

Return ONLY JSON, no other text.`;

  try {
    var response = await callClaude(prompt, 'haiku');

    var cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    var intent = JSON.parse(cleaned);

    return intent;
  } catch (error) {
    console.error('Intent recognition error:', error);
    return { intent: 'UNKNOWN', entities: {} };
  }
}

export { recognizeIntent };
