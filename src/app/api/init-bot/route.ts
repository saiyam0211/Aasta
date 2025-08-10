import { NextRequest, NextResponse } from 'next/server';
import { forceInitializeBot } from '@/lib/telegram-bot-integration';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Manually initializing Telegram bot...');
    
    await forceInitializeBot();
    
    console.log('✅ Bot initialization completed');
    return NextResponse.json({
      status: 'success',
      message: 'Telegram bot initialization completed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error initializing bot:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Error initializing bot',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
} 