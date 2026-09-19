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
