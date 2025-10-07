import { models } from '../db/sequelize.js';
import { recognizeIntent } from './intents.js';
import { runFullUpdate } from '../services/cron.js';
import { Op } from 'sequelize';

async function handleStart(ctx) {
  var message = ctx.message.text.split(' ');

  if (message.length < 2) {
    return ctx.reply('Usage: /start YOUR_JOIN_KEY');
  }

  var joinKey = message[1];

  if (joinKey !== process.env.JOIN_KEY) {
    return ctx.reply('Invalid JOIN_KEY. Access denied.');
  }

  try {
    var [user, created] = await models.User.findOrCreate({
      where: { telegram_id: ctx.from.id },
      defaults: {
        telegram_id: ctx.from.id,
        language: ctx.from.language_code || 'en'
      }
    });

    if (created) {
      ctx.reply('Welcome to ArchangelCS! You can now add your software tags and manage RSS feeds.');
    } else {
      ctx.reply('Welcome back!');
    }
  } catch (error) {
    console.error('Start command error:', error);
    ctx.reply('Registration failed. Please try again.');
  }
}

async function handleMessage(ctx) {
  var telegramId = ctx.from.id;

  var user = await models.User.findOne({ where: { telegram_id: telegramId } });

  if (!user) {
    return ctx.reply('Please register first: /start YOUR_JOIN_KEY');
  }

  var message = ctx.message.text;

  try {
    var intent = await recognizeIntent(message);

    switch (intent.intent) {
      case 'ADD_TAGS':
        await handleAddTags(ctx, user, intent.entities.tags);
        break;
      case 'REMOVE_TAGS':
        await handleRemoveTags(ctx, user, intent.entities.tags);
        break;
      case 'LIST_TAGS':
        await handleListTags(ctx, user);
        break;
      case 'ADD_FEED':
        await handleAddFeed(ctx, intent.entities.url);
        break;
      case 'SHOW_STATS':
        await handleShowStats(ctx);
        break;
      case 'RUN_UPDATE':
        await handleRunUpdate(ctx);
        break;
      case 'HELP':
        await handleHelp(ctx);
        break;
      default:
        ctx.reply('I did not understand that. Type "help" for available commands.');
    }
  } catch (error) {
    console.error('Message handling error:', error);
    ctx.reply('An error occurred. Please try again.');
  }
}

async function handleAddTags(ctx, user, tags) {
  if (!tags || tags.length === 0) {
    return ctx.reply('No tags specified.');
  }

  var normalizedTags = tags.map(t => t.toLowerCase().trim());

  for (var tag of normalizedTags) {
    await models.Tag.findOrCreate({ where: { tag_name: tag } });
  }

  for (var tag of normalizedTags) {
    await models.UserTag.findOrCreate({
      where: { user_id: user.id, tag_name: tag }
    });
  }

  ctx.reply('Tags added: ' + normalizedTags.join(', '));
}

async function handleRemoveTags(ctx, user, tags) {
  if (!tags || tags.length === 0) {
    return ctx.reply('No tags specified.');
  }

  var normalizedTags = tags.map(t => t.toLowerCase().trim());

  await models.UserTag.destroy({
    where: {
      user_id: user.id,
      tag_name: { [Op.in]: normalizedTags }
    }
  });

  ctx.reply('Tags removed: ' + normalizedTags.join(', '));
}

async function handleListTags(ctx, user) {
  var userTags = await models.UserTag.findAll({
    where: { user_id: user.id },
    attributes: ['tag_name']
  });

  if (userTags.length === 0) {
    return ctx.reply('You have no tags. Add some with: "add chrome, firefox"');
  }

  var tagList = userTags.map(ut => ut.tag_name).join(', ');
  ctx.reply('Your tags: ' + tagList);
}

async function handleAddFeed(ctx, url) {
  if (!url) {
    return ctx.reply('No URL specified.');
  }

  try {
    var urlObj = new URL(url);
    var domain = urlObj.hostname;

    var [feed, created] = await models.Feed.findOrCreate({
      where: { url: url },
      defaults: { url: url, domain: domain }
    });

    if (created) {
      ctx.reply('RSS feed added: ' + domain);
    } else {
      ctx.reply('This feed already exists.');
    }
  } catch (error) {
    console.error('Add feed error:', error);
    ctx.reply('Invalid URL or feed addition failed.');
  }
}

async function handleShowStats(ctx) {
  try {
    ctx.reply('Fetching system stats...');
    var [feedCount, tagCount, newsCount, unprocessedNewsCount] = await Promise.all([
      models.Feed.count(),
      models.Tag.count(),
      models.News.count(),
      models.News.count({ where: { is_analyzed: false } }),
    ]);
    ctx.reply('Feeds: ' + feedCount + ' \nTags: ' + tagCount + ' \nNews: ' + newsCount + ' \nUnprocessed news: ' + unprocessedNewsCount);
  } catch (error) {
    console.error('Error fetching system stats: ', error);
  }
}

async function handleRunUpdate(ctx) {
  ctx.reply('Starting full update for all users...');

  try {
    await runFullUpdate();
  } catch (error) {
    console.error('Manual update error:', error);
  }
}

async function handleHelp(ctx) {
  var helpText = `
Available commands:

Add tags: "add chrome, firefox, linux"
Remove tags: "remove windows"
List tags: "show my tags"
Add RSS feed: "add feed https://example.com/rss"
Help: "help"
------------------------ ADMIN ------------------------
Show system stats: "show stats"
Refresh news and notify all users: "run update now"
  `.trim();

  ctx.reply(helpText);
}

export { handleStart, handleMessage };
