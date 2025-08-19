'use server';

import { initializeTelegramBot } from '@/lib/telegram-bot-integration';

export async function TelegramBotInitializer() {
  if (process.env.ENABLE_TELEGRAM_BOT === 'true') {
    await initializeTelegramBot();
  }
  return null;
}
