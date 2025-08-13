import { NextRequest, NextResponse } from 'next/server';
import { getTelegramBot } from '@/lib/telegram-bot-integration';

export async function GET(request: NextRequest) {
  try {
    const bot = getTelegramBot();

    if (!bot) {
      return NextResponse.json({
        status: 'error',
        message: 'Telegram bot not initialized',
        botAvailable: false,
      });
    }

    // Test bot functionality
    const botInfo = await bot.bot.getMe();

    return NextResponse.json({
      status: 'success',
      message: 'Telegram bot is working',
      botAvailable: true,
      botInfo: {
        id: botInfo.id,
        username: botInfo.username,
        firstName: botInfo.first_name,
        isBot: botInfo.is_bot,
      },
    });
  } catch (error) {
    console.error('Error testing Telegram bot:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to test Telegram bot',
      error: error instanceof Error ? error.message : 'Unknown error',
      botAvailable: false,
    });
  }
}
