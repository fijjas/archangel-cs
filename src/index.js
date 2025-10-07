import 'dotenv/config';
import { sequelize, initModels } from './db/sequelize.js';
import bot from './bot/bot.js';
import { startCronJob } from './services/cron.js';

async function start() {
  try {
    console.log('Starting ArchangelCS...');

    initModels();

    await sequelize.authenticate();
    console.log('Database connected');

    await sequelize.sync();
    console.log('Database synced');

    bot.launch();
    console.log('Telegram bot started');

    startCronJob();
    console.log('Cron job scheduled');

    console.log('ArchangelCS is running');

    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));

  } catch (error) {
    console.error('Failed to start:', error);
    process.exit(1);
  }
}

start();
