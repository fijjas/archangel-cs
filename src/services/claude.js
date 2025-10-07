import Anthropic from '@anthropic-ai/sdk';

var client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY
});

async function callClaude(prompt, model = 'haiku', maxTokens = 1000) {
  var modelName = model === 'haiku'
    ? 'claude-3-5-haiku-20241022'
    : 'claude-sonnet-4-20250514';

  try {
    var response = await client.messages.create({
      model: modelName,
      max_tokens: maxTokens,
      messages: [
        { role: 'user', content: prompt }
      ]
    });

    return response.content[0].text;
  } catch (error) {
    console.error('Claude API error:', error);
    throw error;
  }
}

export { callClaude };
