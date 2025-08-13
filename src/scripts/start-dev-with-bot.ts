#!/usr/bin/env tsx

import { spawn } from 'child_process';
import { forceInitializeBot } from '@/lib/telegram-bot-integration';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function startDevWithBot() {
  console.log('🚀 Starting Next.js dev server with Telegram bot...');

  // Initialize the bot first
  try {
    await forceInitializeBot();
    console.log('✅ Telegram bot initialized successfully!');
  } catch (error) {
    console.error('❌ Failed to initialize Telegram bot:', error);
  }

  // Start Next.js dev server
  const nextDev = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down dev server and bot...');
    nextDev.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down dev server and bot...');
    nextDev.kill('SIGTERM');
    process.exit(0);
  });

  nextDev.on('error', (error) => {
    console.error('❌ Failed to start Next.js dev server:', error);
    process.exit(1);
  });
}

// Start the development server with bot
startDevWithBot().catch(console.error);
