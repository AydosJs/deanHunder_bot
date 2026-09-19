import { Bot, Context, GrammyError } from 'grammy';
import { config } from './config.js';
import { supabase } from './supabase.js';
import { mainMenu, floorMenu, roomMenu, evidenceMenu } from './keyboards.js';
import { roomsForFloor } from './locations.js';
import { rankCards, cardText, type Sighting, type Vote } from './cards.js';

export const bot = new Bot(config.TELEGRAM_BOT_TOKEN);
async function show(ctx: Context, text: string, keyboard = mainMenu()) {
  try {
    if (ctx.callbackQuery?.message) await ctx.editMessageText(text, { reply_markup: keyboard });
    else await ctx.reply(text, { reply_markup: keyboard });
  } catch (err) {
    if (err instanceof GrammyError && err.description.includes('message is not modified')) return;
    throw err;
  }
}
async function ensureUser(ctx: Context) {
  if (!ctx.from) throw new Error('Missing user');
  const { data, error } = await supabase.from('users').upsert({ telegram_user_id: ctx.from.id }, { onConflict: 'telegram_user_id' }).select('id').single();
  if (error || !data) throw new Error('User lookup failed');
  return data.id as number;
}
async function latest(ctx: Context, note = '') {
  const now = Date.now();
  const ttl = config.REPORT_EXPIRY_MINUTES * 60000;
  const [s, v] = await Promise.all([
    supabase.from('sightings').select('location_id,reporter_user_id,created_at,expires_at,locations(floor,room)').eq('status','active').gt('expires_at',new Date(now).toISOString()).order('created_at',{ascending:false}).limit(500),
    supabase.from('sighting_votes').select('location_id,user_id,vote_type,created_at').gt('created_at',new Date(now-ttl).toISOString()).order('created_at',{ascending:false}).limit(1000)
  ]);
  if (s.error || v.error) throw new Error('Evidence lookup failed');
  const cards = rankCards(s.data as unknown as Sighting[], v.data as Vote[], now, ttl);
  const best = cards[0];
  if (!best) return show(ctx, '🤷 No fresh sightings. Seen them?');
  let text = cardText(best);
  if (cards[1] && best.score - cards[1].score <= 2) text += `\n⚠️ Also reported: F${cards[1].floor} · ${cards[1].room}`;
  if (note) text += '\n' + note;
  await show(ctx, text, evidenceMenu(String(best.id), best.confirms, best.rejects, best.left));
}

// Acknowledge taps immediately; database work then updates the same message.
bot.on('callback_query:data', async (ctx, next) => {
  await ctx.answerCallbackQuery().catch(() => undefined);
  try { await next(); }
  catch { console.error('Bot action failed'); await show(ctx, '⚠️ Couldn’t finish. Try again.'); }
});
bot.command(['start','menu','cancel'], ctx => show(ctx, '👀 Seen the dean?'));
bot.command('help', ctx => show(ctx, '📍 Pick floor → room.\n✅ Vote only if you saw them.\n⏳ Sightings expire. Reports can be wrong.'));
bot.command('where', ctx => latest(ctx));
bot.command('report', ctx => show(ctx, '📍 Which floor?', floorMenu()));
bot.callbackQuery('home', ctx => show(ctx, '👀 Seen the dean?'));
bot.callbackQuery('report', ctx => show(ctx, '📍 Which floor?', floorMenu()));
bot.callbackQuery(/^floor:([1-4])$/, ctx => show(ctx, `📍 Floor ${ctx.match[1]} · Pick room`, roomMenu(Number(ctx.match[1]))));
bot.callbackQuery(/^room:([1-4]):(\d+)$/, async ctx => {
  const floor = Number(ctx.match[1]), room = Number(ctx.match[2]);
  if (!roomsForFloor(floor).includes(room)) return show(ctx, 'Choose a room below.', roomMenu(floor));
  const [userId, result] = await Promise.all([
    ensureUser(ctx),
    supabase.from('locations').upsert({ building:1, floor, room, is_active:true },{onConflict:'building,floor,room'}).select('id').single()
  ]);
  if (result.error || !result.data) throw new Error('Location lookup failed');
  const { data: previous, error: previousError } = await supabase.from('sightings').select('id').eq('reporter_user_id',userId).eq('location_id',result.data.id).eq('status','active').gt('expires_at',new Date().toISOString()).limit(1);
  if (previousError) throw new Error('Report lookup failed');
  if (previous?.length) return show(ctx, `✅ Already reported · F${floor} / ${room}`);
  const { error } = await supabase.from('sightings').insert({ location_id:result.data.id,reporter_user_id:userId,expires_at:new Date(Date.now()+config.REPORT_EXPIRY_MINUTES*60000).toISOString(),status:'active' });
  if (error) throw new Error('Report save failed');
  await show(ctx, `✅ Reported · Floor ${floor} / ${room}\nThanks for the heads-up 👀`);
});
bot.callbackQuery('latest', ctx => latest(ctx));
bot.callbackQuery(/^vote:(confirm|reject|left):(\d+)$/, async ctx => {
  const id = Number(ctx.match[2]);
  const [userId, active] = await Promise.all([
    ensureUser(ctx),
    supabase.from('sightings').select('id').eq('location_id',id).eq('status','active').gt('expires_at',new Date().toISOString()).limit(1)
  ]);
  if (active.error) throw new Error('Report lookup failed');
  if (!active.data?.length) return latest(ctx, '⌛ That sighting expired.');
  const { error } = await supabase.from('sighting_votes').upsert({location_id:id,user_id:userId,vote_type:ctx.match[1],created_at:new Date().toISOString()},{onConflict:'location_id,user_id'});
  if (error) throw new Error('Vote save failed');
  await latest(ctx, '✓ Your vote is saved');
});
bot.callbackQuery('help', ctx => show(ctx, '📍 Floor → room. Done.\n✅ Vote only on what you saw.\n⏳ Old reports disappear.'));
bot.callbackQuery('donate', ctx => show(ctx, '☕ Coffee fund brewing…\nDonations aren’t enabled yet.'));
bot.on('callback_query:data', ctx => show(ctx, 'That button is old. Try these 👇'));
