import type { IncomingMessage, ServerResponse } from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import type { Update } from 'grammy/types';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.writeHead(405).end('Method not allowed');
    return;
  }
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret || !/^[A-Za-z0-9_-]{32,256}$/.test(secret)) {
    res.writeHead(503).end('Webhook is not configured');
    return;
  }
  const header = req.headers['x-telegram-bot-api-secret-token'];
  if (typeof header !== 'string' || Buffer.byteLength(header) !== Buffer.byteLength(secret) ||
      !timingSafeEqual(Buffer.from(header), Buffer.from(secret))) {
    res.writeHead(401).end('Unauthorized');
    return;
  }
  try {
    const [{ bot }, { webhookCallback }] = await Promise.all([
      import('../src/bot.js'), import('grammy')
    ]);
    // Vercel parses JSON before invoking the function; its request stream may be consumed.
    const parsed = (req as IncomingMessage & { body?: Update }).body;
    if (parsed !== undefined) {
      if (!parsed || !Number.isInteger(parsed.update_id)) {
        res.writeHead(400).end('Invalid update');
        return;
      }
      const adapter = () => ({
        update: parsed,
        header,
        end: () => { res.end(); },
        respond: (json: string) => { res.writeHead(200, { 'Content-Type': 'application/json' }).end(json); },
        unauthorized: () => { res.writeHead(401).end('Unauthorized'); }
      });
      await webhookCallback(bot, adapter, 'throw', 25000, secret)();
    } else {
      await webhookCallback(bot, 'http', 'throw', 25000, secret)(req, res);
    }
  } catch {
    console.error('Telegram webhook processing failed.');
    if (!res.headersSent) res.writeHead(500).end('Update failed');
    else if (!res.writableEnded) res.end();
  }
}
