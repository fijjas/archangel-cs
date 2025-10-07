import { callClaude } from './claude.js';
import { models } from '../db/sequelize.js';

async function analyzeNews(news) {
  var existingTags = await models.Tag.findAll();
  var existingTagNames = existingTags.map(t => t.tag_name);

  var prompt = `Analyze this cybersecurity news article and extract relevant tags.

Title: ${news.title}
Description: ${news.description}
URL: ${news.url}

Existing tags in system: ${existingTagNames.join(', ')}

Extract:
1. Tags: software, OS, devices, or technologies mentioned (e.g., chrome, linux, windows, firefox, cisco, android)
2. CVE code: if mentioned (e.g., CVE-2024-1234), return only ONE primary CVE

Return ONLY valid JSON:
{
  "tags": ["tag1", "tag2"],
  "cve_code": "CVE-2024-1234"
}

Rules:
- Return tags as lowercase, trimmed strings
- Include both existing tags and new ones
- If no CVE, set cve_code to null
- Return ONLY ONE most important CVE code
- Return ONLY JSON, no other text`;

  try {
    var response = await callClaude(prompt, 'sonnet', 1500);

    var cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    var analysis = JSON.parse(cleaned);

    return {
      tags: analysis.tags || [],
      cve_code: analysis.cve_code || null
    };
  } catch (error) {
    console.error('Analysis error for news', news.id, ':', error.message);
    return { tags: [], cve_code: null };
  }
}

async function analyzeAllUnprocessed() {
  var unanalyzed = await models.News.findAll({
    where: { is_analyzed: false },
    limit: 100
  });

  console.log('Analyzing', unanalyzed.length, 'articles');

  for (var news of unanalyzed) {
    var analysis = await analyzeNews(news);

    for (var tagName of analysis.tags) {
      var normalizedTag = tagName.toLowerCase().trim();

      await models.Tag.findOrCreate({ where: { tag_name: normalizedTag } });

      await models.NewsTag.findOrCreate({
        where: {
          news_id: news.id,
          tag_name: normalizedTag
        }
      });
    }

    await news.update({
      cve_code: analysis.cve_code,
      is_analyzed: true
    });

    console.log('Analyzed:', news.id, '-', analysis.tags.length, 'tags');
  }

  console.log('Analysis completed');
}

export { analyzeAllUnprocessed };
