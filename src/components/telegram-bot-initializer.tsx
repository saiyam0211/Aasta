'use server';

import { initializeTelegramBot } from '@/lib/telegram-bot-integration';

export async function TelegramBotInitializer() {
  // Initialize the Telegram bot on server startup
  await initializeTelegramBot();

  // This component doesn't render anything
  return null;
}
