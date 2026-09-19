import { bot } from './bot.js';
bot.catch(() => console.error('Bot update failed.'));
process.once('SIGINT', () => bot.stop());
process.once('SIGTERM', () => bot.stop());
await bot.start({ onStart: (info) => console.log(`Bot started as @${info.username}`) });
