import Parser from 'rss-parser';
import moment from 'moment';
import { models } from '../db/sequelize.js';

var parser = new Parser();

async function fetchAndSaveNews(feed) {
  try {
    console.log('Fetching feed:', feed.domain);

    var rssFeed = await parser.parseURL(feed.url);
    var savedCount = 0;

    for (var item of rssFeed.items) {
      var publishedAt = parseDate(item.pubDate || item.isoDate);

      var existing = await models.News.findOne({
        where: {
          feed_id: feed.id,
          url: item.link
        }
      });

      if (existing) {
        continue;
      }

      await models.News.create({
        feed_id: feed.id,
        url: item.link,
        title: item.title || 'Untitled',
        content: item.content || item.contentSnippet || '',
        description: item.contentSnippet || item.summary || '',
        published_at: publishedAt,
        is_analyzed: false
      });

      savedCount++;
    }

    console.log('Saved', savedCount, 'new articles from', feed.domain);
    return savedCount;

  } catch (error) {
    console.error('Error fetching feed', feed.domain, ':', error.message);
    return 0;
  }
}

function parseDate(dateString) {
  if (!dateString) {
    return new Date();
  }

  var parsed = moment(dateString, [
    moment.RFC_2822,
    moment.ISO_8601,
    'YYYY-MM-DD',
    'ddd, DD MMM YYYY HH:mm:ss Z',
    'ddd, DD MMM YYYY HH:mm:ss ZZ'
  ]);

  return parsed.isValid() ? parsed.toDate() : new Date();
}

async function fetchAllFeeds() {
  var feeds = await models.Feed.findAll();
  var totalSaved = 0;

  for (var feed of feeds) {
    var count = await fetchAndSaveNews(feed);
    totalSaved += count;
  }

  console.log('Total new articles:', totalSaved);
  return totalSaved;
}

export { fetchAllFeeds, fetchAndSaveNews };
