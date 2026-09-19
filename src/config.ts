import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  ADMIN_TELEGRAM_IDS: z.string().default(''),
  TIMEZONE: z.string().default('Asia/Tashkent'),
  REPORT_EXPIRY_MINUTES: z.coerce.number().int().positive().default(10)
});

export const config = schema.parse(process.env);
export const adminIds = new Set(config.ADMIN_TELEGRAM_IDS.split(',').map((id) => id.trim()).filter(Boolean));
