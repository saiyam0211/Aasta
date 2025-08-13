#!/usr/bin/env tsx

import { TelegramBotService } from '@/lib/telegram-bot-service';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

async function startTelegramBot() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    console.error('❌ TELEGRAM_BOT_TOKEN is not set in environment variables');
    console.log('🔧 Please add TELEGRAM_BOT_TOKEN to your .env.local file');
    console.log('📖 Get a bot token from @BotFather on Telegram');
    process.exit(1);
  }

  try {
    console.log('🚀 Starting Telegram Bot Service...');

    const telegramBot = new TelegramBotService(botToken);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Received SIGINT, shutting down gracefully...');
      telegramBot.bot.stopPolling();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
      telegramBot.bot.stopPolling();
      process.exit(0);
    });

    console.log('✅ Telegram Bot Service started successfully!');
    console.log('📱 Bot is now listening for messages...');
    console.log('💡 Try sending /start to your bot');
    console.log('🔄 Press Ctrl+C to stop the bot');
  } catch (error) {
    console.error('❌ Failed to start Telegram Bot Service:', error);
    process.exit(1);
  }
}

// Start the bot
startTelegramBot().catch(console.error);
