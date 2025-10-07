import { Telegraf } from 'telegraf';
import { handleStart, handleMessage } from './commands.js';

var bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.command('start', handleStart);

bot.on('text', handleMessage);

bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('An error occurred. Please try again.');
});

export default bot;
