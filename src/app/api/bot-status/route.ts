import { NextRequest, NextResponse } from 'next/server';
import { getTelegramBot } from '@/lib/telegram-bot-integration';

export async function GET(request: NextRequest) {
  try {
    const bot = getTelegramBot();
    
    if (!bot) {
      return NextResponse.json({
        status: 'not_initialized',
        message: 'Telegram bot is not initialized',
        timestamp: new Date().toISOString()
      });
    }

    // Try to get bot info to verify it's working
    try {
      const botInfo = await bot.bot.getMe();
      return NextResponse.json({
        status: 'running',
        message: 'Telegram bot is running',
        botInfo: {
          id: botInfo.id,
          username: botInfo.username,
          firstName: botInfo.first_name
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return NextResponse.json({
        status: 'error',
        message: 'Bot instance exists but failed to get info',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to check bot status',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
} 