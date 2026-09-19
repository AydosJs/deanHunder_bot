# Dean Radar Telegram Bot

Telegram MVP for Building 1. Students report a floor and room, then other students see the strongest recent report with evidence.

## Run locally

1. Create a Telegram bot with BotFather.
2. Create a free Supabase project.
3. Run `supabase/migrations/001_initial.sql` in the Supabase SQL editor.
4. Copy `.env.example` to `.env` and fill in the values.
5. Install dependencies with `npm install`.
6. Start with `npm run dev`.

The current donation button is intentionally a safe placeholder until Telegram Stars payment configuration is added. Never commit bot tokens or payment secrets.

## Deploy to Vercel

1. Import `AydosJs/deanHunder_bot` in Vercel. Choose framework **Other**, repository root, and Node.js 22.x. The repository config sets the build command and static output directory; do not use `npm start` as a build command.
2. Add production environment variables: `TELEGRAM_BOT_TOKEN`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `TELEGRAM_WEBHOOK_SECRET`. Optional: `REPORT_EXPIRY_MINUTES=10`.
3. Generate a webhook secret with `node -e 'console.log(require("node:crypto").randomBytes(32).toString("hex"))'`. Save the same value in Vercel and your private local `.env`.
4. Deploy. Visit `https://YOUR-PROJECT.vercel.app/api/health`; it must show JSON without a Vercel login. Ensure the production endpoint is publicly reachable. The Telegram route itself requires the secret header.
5. Stop any local `npm run dev` process, then run locally:

```sh
node scripts/register-webhook.mjs https://YOUR-PROJECT.vercel.app
```

6. Send `/start` to the bot in Telegram and try reporting and querying. Use the stable production URL, not a preview URL. Register again if the domain or secret changes; redeploy after changing Vercel environment variables.

The health route confirms the deployment is reachable, not database connectivity. Donations remain a placeholder. Report deduplication and expiring votes still need hardening before a broad launch; current votes are per location and counts are not guaranteed independent.
