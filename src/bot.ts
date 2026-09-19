import { Bot, Context, InlineKeyboard } from 'grammy';
import { config } from './config.js';
import { supabase } from './supabase.js';
import { mainMenu, floorMenu, roomMenu, evidenceMenu } from './keyboards.js';
import { confidence, scoreEvidence } from './scoring.js';

export const bot = new Bot(config.TELEGRAM_BOT_TOKEN);
const userState = new Map<number, { floor?: number }>();

async function ensureUser(ctx: Context) {
  const telegramUserId = ctx.from?.id;
  if (!telegramUserId) return null;
  const { data } = await supabase.from('users').upsert({ telegram_user_id: telegramUserId }, { onConflict: 'telegram_user_id' }).select('id').single();
  return data?.id ?? null;
}

bot.command('start', async (ctx) => {
  await ensureUser(ctx);
  await ctx.reply('☕ Dean radar is live. Seen them? Drop a report.', { reply_markup: mainMenu() });
});

bot.command('help', (ctx) => ctx.reply('See the dean? Report the floor and room. Confirm only if you actually saw them. Reports expire quickly.', { reply_markup: mainMenu() }));
bot.command('cancel', (ctx) => { if (ctx.from) userState.delete(ctx.from.id); return ctx.reply('Cancelled.', { reply_markup: mainMenu() }); });

bot.callbackQuery('home', async (ctx) => { await ctx.answerCallbackQuery(); await ctx.editMessageText('What do you need?', { reply_markup: mainMenu() }); });
bot.callbackQuery('report', async (ctx) => { await ctx.answerCallbackQuery(); await ctx.editMessageText('Where did you see them?', { reply_markup: floorMenu() }); });
bot.callbackQuery(/^floor:(\d+)$/, async (ctx) => { await ctx.answerCallbackQuery(); const floor = Number(ctx.match[1]); userState.set(ctx.from.id, { floor }); await ctx.editMessageText(`Floor ${floor}: which room?`, { reply_markup: roomMenu(floor) }); });
bot.callbackQuery(/^room:(\d+):(\d+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const floor = Number(ctx.match[1]); const room = Number(ctx.match[2]);
  const userId = await ensureUser(ctx);
  if (!userId) return;
  const { data: location } = await supabase.from('locations').upsert({ building: 1, floor, room, is_active: true }, { onConflict: 'building,floor,room' }).select('id').single();
  if (!location) return ctx.editMessageText('Could not save that report. Try again.', { reply_markup: mainMenu() });
  const expires = new Date(Date.now() + config.REPORT_EXPIRY_MINUTES * 60_000).toISOString();
  const { error } = await supabase.from('sightings').insert({ location_id: location.id, reporter_user_id: userId, expires_at: expires, status: 'active' });
  await ctx.editMessageText(error ? 'Could not save that report. Try again.' : `✅ Reported: Floor ${floor}, Room ${room}`, { reply_markup: mainMenu() });
});

bot.callbackQuery('latest', async (ctx) => {
  await ctx.answerCallbackQuery();
  const { data } = await supabase.from('sightings').select('location_id, created_at, locations(floor, room)').eq('status', 'active').gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }).limit(100);
  if (!data?.length) return ctx.editMessageText('🤷 No reliable recent report yet.', { reply_markup: mainMenu() });
  const grouped = new Map<string, { floor: number; room: number; reports: number; latest: string }>();
  for (const sighting of data as any[]) { const loc = sighting.locations; const key = sighting.location_id; const current = grouped.get(key) ?? { floor: loc.floor, room: loc.room, reports: 0, latest: sighting.created_at }; current.reports++; if (sighting.created_at > current.latest) current.latest = sighting.created_at; grouped.set(key, current); }
  const best = [...grouped.entries()].sort((a, b) => b[1].reports - a[1].reports)[0];
  const [locationId, result] = best; const minutesAgo = Math.max(0, Math.floor((Date.now() - Date.parse(result.latest)) / 60_000));
  const { data: votes } = await supabase.from('sighting_votes').select('vote_type').eq('location_id', locationId);
  const confirms = votes?.filter((vote) => vote.vote_type === 'confirm').length ?? 0;
  const rejects = votes?.filter((vote) => vote.vote_type === 'reject' || vote.vote_type === 'left').length ?? 0;
  const evidence = { reports: result.reports, confirms, rejects, minutesAgo }; const level = confidence(evidence);
  await ctx.editMessageText(`📍 Most likely: Floor ${result.floor}, Room ${result.room}\n\n👀 ${evidence.reports} reports · ✅ ${evidence.confirms} confirmed · ❌ ${evidence.rejects} rejected\n⏱ ${minutesAgo} min ago · Confidence: ${level}`, { reply_markup: evidenceMenu(locationId) });
});

bot.callbackQuery(/^vote:(confirm|reject|left):(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery('Thanks — evidence updated.');
  const userId = await ensureUser(ctx); if (!userId) return;
  await supabase.from('sighting_votes').upsert({ location_id: ctx.match[2], user_id: userId, vote_type: ctx.match[1] }, { onConflict: 'location_id,user_id' });
});

bot.callbackQuery('help', async (ctx) => { await ctx.answerCallbackQuery(); await ctx.editMessageText('See the dean? Report the floor and room. Confirm only if you actually saw them. Reports expire quickly.', { reply_markup: mainMenu() }); });
bot.callbackQuery('donate', async (ctx) => { await ctx.answerCallbackQuery(); await ctx.editMessageText('☕ Like the bot? Buy it a virtual coffee.\n\nTelegram Stars donations can be connected next.', { reply_markup: new InlineKeyboard().text('⬅️ Back', 'home') }); });
