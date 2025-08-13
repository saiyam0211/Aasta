import TelegramBotSingleton from './telegram-bot-singleton';

let isInitialized = false;

export async function initializeTelegramBot() {
  if (isInitialized) {
    return;
  }

  try {
    console.log('🔧 Initializing Telegram Bot integration...');

    // Initialize the Telegram bot singleton
    const bot = await TelegramBotSingleton.getInstance();

    if (bot) {
      console.log('✅ Telegram Bot integrated successfully with Next.js app');
      isInitialized = true;
    } else {
      console.log(
        '⚠️ Telegram Bot not initialized (TELEGRAM_BOT_TOKEN not found)'
      );
    }
  } catch (error) {
    console.error('❌ Failed to initialize Telegram Bot integration:', error);
  }
}

export function getTelegramBot() {
  return TelegramBotSingleton.getInstanceSync();
}

export async function stopTelegramBot() {
  await TelegramBotSingleton.stopBot();
  isInitialized = false;
}

// Force initialization function for development
export async function forceInitializeBot() {
  console.log('🚀 Force initializing Telegram bot...');
  isInitialized = false;
  return await initializeTelegramBot();
}
