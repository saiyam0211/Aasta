#!/usr/bin/env tsx

import { forceInitializeBot } from '@/lib/telegram-bot-integration';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

async function startBotOnly() {
  console.log('🚀 Starting Telegram Bot only...');
  
  try {
    await forceInitializeBot();
    console.log('✅ Telegram bot started successfully!');
    console.log('📱 Bot is now listening for messages...');
    console.log('💡 Try sending /start to your bot');
    console.log('🔄 Press Ctrl+C to stop the bot');
    
    // Keep the process running
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down bot...');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down bot...');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to start bot:', error);
    process.exit(1);
  }
}

// Start the bot
startBotOnly().catch(console.error); 