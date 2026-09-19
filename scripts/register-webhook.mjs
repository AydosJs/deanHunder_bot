import 'dotenv/config';
const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_WEBHOOK_SECRET: secret } = process.env;
const input = process.argv[2];
if (!token || !secret || !/^[A-Za-z0-9_-]{32,256}$/.test(secret) || !input) {
  console.error('Set TELEGRAM_BOT_TOKEN and TELEGRAM_WEBHOOK_SECRET in .env, then run: node scripts/register-webhook.mjs https://YOUR-PROJECT.vercel.app');
  process.exit(1);
}
try {
  const base = new URL(input);
  if (base.protocol !== 'https:' || base.username || base.password) throw new Error();
  const health = await fetch(new URL('/api/health', base), { redirect: 'error' });
  if (!health.ok || (await health.json()).service !== 'DeanHunterBot') {
    console.error('Deployment is not publicly reachable. Check the URL and Vercel deployment protection.');
    process.exit(1);
  }
  const result = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: new URL('/api/telegram', base).href, secret_token: secret,
      allowed_updates: ['message', 'callback_query'], max_connections: 1, drop_pending_updates: false })
  });
  const data = await result.json();
  if (!data.ok) { console.error('Telegram rejected webhook registration. Check your token and deployment.'); process.exit(1); }
  console.log('Telegram webhook registered. Stop any local polling bot, then test /start in Telegram.');
} catch { console.error('Webhook registration failed. Check configuration and network access.'); process.exitCode = 1; }
