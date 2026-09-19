import { afterEach, describe, expect, it, vi } from 'vitest';
import type { IncomingMessage, ServerResponse } from 'node:http';
import handler from '../api/telegram.js';

const dispatch = vi.hoisted(() => vi.fn(async (_req, res) => { res.end('ok'); }));
vi.mock('../src/bot.js', () => ({ bot: {} }));
vi.mock('grammy', () => ({ webhookCallback: () => dispatch }));
const secret = 'a'.repeat(64);
function response() {
  const res = { setHeader: vi.fn(), writeHead: vi.fn(), end: vi.fn(), headersSent: false };
  res.writeHead.mockReturnValue(res);
  return res;
}
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });
describe('webhook boundary', () => {
  it('rejects GET before initializing the bot', async () => {
    const res = response();
    await handler({ method: 'GET', headers: {} } as IncomingMessage, res as unknown as ServerResponse);
    expect(res.writeHead).toHaveBeenCalledWith(405);
    expect(dispatch).not.toHaveBeenCalled();
  });
  it('fails closed without a configured secret', async () => {
    vi.stubEnv('TELEGRAM_WEBHOOK_SECRET', '');
    const res = response();
    await handler({ method: 'POST', headers: {} } as IncomingMessage, res as unknown as ServerResponse);
    expect(res.writeHead).toHaveBeenCalledWith(503);
  });
  it('rejects a forged same-length secret', async () => {
    vi.stubEnv('TELEGRAM_WEBHOOK_SECRET', secret);
    const res = response();
    await handler({ method: 'POST', headers: { 'x-telegram-bot-api-secret-token': 'b'.repeat(64) } } as unknown as IncomingMessage, res as unknown as ServerResponse);
    expect(res.writeHead).toHaveBeenCalledWith(401);
    expect(dispatch).not.toHaveBeenCalled();
  });
  it('awaits processing of authenticated requests', async () => {
    vi.stubEnv('TELEGRAM_WEBHOOK_SECRET', secret);
    const res = response();
    await handler({ method: 'POST', headers: { 'x-telegram-bot-api-secret-token': secret } } as unknown as IncomingMessage, res as unknown as ServerResponse);
    expect(dispatch).toHaveBeenCalledOnce();
    expect(res.end).toHaveBeenCalledWith('ok');
  });
});
