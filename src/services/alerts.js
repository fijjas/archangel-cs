import { callClaude } from './claude.js';
import { models } from '../db/sequelize.js';
import { Op } from 'sequelize';
import bot from '../bot/bot.js';

async function sendAlertsToUser(user) {
  try {
    var userTags = await models.UserTag.findAll({
      where: { user_id: user.id },
      attributes: ['tag_name']
    });

    if (userTags.length === 0) {
      return;
    }

    var tagNames = userTags.map(ut => ut.tag_name);

    var lastNotification = await models.Notification.findOne({
      where: { user_id: user.id },
      order: [['sent_at', 'DESC']]
    });

    var minNewsId = 0;
    if (lastNotification && lastNotification.news_ids.length > 0) {
      minNewsId = Math.max(...lastNotification.news_ids);
    }

    var relevantNews = await models.News.findAll({
      where: {
        id: { [Op.gt]: minNewsId },
        is_analyzed: true
      },
      include: [{
        model: models.Tag,
        where: { tag_name: { [Op.in]: tagNames } },
        through: { attributes: [] }
      }, {
        model: models.Feed
      }]
    });

    if (relevantNews.length === 0) {
      return;
    }

    console.log('Found', relevantNews.length, 'relevant news for user', user.telegram_id);

    var groupedAlerts = await groupNews(relevantNews, user.language);

    if (groupedAlerts.length === 0) {
      return;
    }

    for (var alert of groupedAlerts) {
      var message = formatAlert(alert);
      await bot.telegram.sendMessage(user.telegram_id, message, { parse_mode: 'HTML' });
    }

    var newsIds = relevantNews.map(n => n.id);
    await models.Notification.create({
      user_id: user.id,
      news_ids: newsIds
    });

    console.log('Sent', groupedAlerts.length, 'alerts to user', user.telegram_id);

  } catch (error) {
    console.error('Error sending alerts to user', user.telegram_id, ':', error.message);
  }
}

async function groupNews(newsList, language) {
  var newsData = newsList.map(n => ({
    id: n.id,
    title: n.title,
    date: n.published_at,
    tags: n.Tags.map(t => t.tag_name),
    domain: n.Feed.domain,
    url: n.url,
    cve_code: n.cve_code
  }));

  var prompt = `Group similar cybersecurity news articles into consolidated alerts.

News articles:
${JSON.stringify(newsData, null, 2)}

Group similar threats together. Return alerts in ${language === 'ru' ? 'Russian' : 'English'} language.

Return ONLY valid JSON array:
[
  {
    "title": "Alert title summarizing the threat",
    "description": "Brief description of the threat",
    "tags": ["tag1", "tag2"],
    "sources": ["domain1.com", "domain2.com"],
    "cve_codes": ["CVE-2024-1234"],
    "urls": ["https://..."]
  }
]

Rules:
- Merge similar threats into one alert
- Keep title concise
- List all relevant tags
- List all source domains
- Include all CVE codes mentioned
- Include all news URLs
- Generate content in ${language === 'ru' ? 'Russian' : 'English'}
- Return ONLY JSON array, no other text`;

  try {
    var response = await callClaude(prompt, 'sonnet', 3000);

    var cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    var alerts = JSON.parse(cleaned);

    return Array.isArray(alerts) ? alerts : [];
  } catch (error) {
    console.error('News grouping error:', error.message);
    return [];
  }
}

function formatAlert(alert) {
  var message = `<b>🔔 ${alert.title}</b>\n\n`;
  message += `${alert.description}\n\n`;

  if (alert.tags && alert.tags.length > 0) {
    message += `<b>Tags:</b> ${alert.tags.join(', ')}\n`;
  }

  if (alert.cve_codes && alert.cve_codes.length > 0) {
    var cveLinks = alert.cve_codes.map(cve =>
      `<a href="https://nvd.nist.gov/vuln/detail/${cve}">${cve}</a>`
    ).join(', ');
    message += `<b>CVE:</b> ${cveLinks}\n`;
  }

  if (alert.sources && alert.sources.length > 0) {
    message += `<b>Sources:</b> ${alert.sources.join(', ')}\n`;
  }

  if (alert.urls && alert.urls.length > 0) {
    message += `\n<b>Read more:</b>\n`;
    alert.urls.forEach((url, i) => {
      message += `${i + 1}. ${url}\n`;
    });
  }

  return message;
}

async function sendAlertsToAllUsers() {
  var users = await models.User.findAll();

  console.log('Sending alerts to', users.length, 'users');

  for (var user of users) {
    await sendAlertsToUser(user);
  }

  console.log('Alert distribution completed');
}

export { sendAlertsToAllUsers };
