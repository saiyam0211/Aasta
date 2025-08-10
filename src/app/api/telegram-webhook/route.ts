import { NextRequest, NextResponse } from 'next/server';
import TelegramBot from 'node-telegram-bot-api';
import { prisma } from '@/lib/prisma';

// Create a bot instance for webhook handling
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN || '', { polling: false });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Process the webhook update directly
    if (body.message) {
      const msg = body.message;
      const chatId = msg.chat.id;
      const text = msg.text;

      if (text) {
        if (text.startsWith('/start')) {
          await handleStartCommand(msg);
        } else if (text.startsWith('/status')) {
          await handleStatusCommand(msg);
        } else if (text.startsWith('/menu')) {
          await handleMenuCommand(msg);
        }
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling Telegram webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Command handlers
async function handleStartCommand(msg: any) {
  const chatId = msg.chat.id;
  
  try {
    const existingPartner = await prisma.deliveryPartner.findFirst({
      where: { telegramChatId: chatId.toString() },
      include: { user: { select: { name: true } } }
    });

    if (existingPartner) {
      await bot.sendMessage(chatId, `🚚 Welcome back, ${existingPartner.user?.name || 'Partner'}!`);
    } else {
      await bot.sendMessage(chatId, '🚚 Welcome to Aasta Delivery! Please contact admin for registration.');
    }
  } catch (error) {
    console.error('Error handling start command:', error);
  }
}

async function handleStatusCommand(msg: any) {
  const chatId = msg.chat.id;
  
  try {
    const partner = await prisma.deliveryPartner.findFirst({
      where: { telegramChatId: chatId.toString() }
    });

    if (partner) {
      const status = partner.status === 'AVAILABLE' ? '🟢 Available' : 
                    partner.status === 'BUSY' ? '🟡 Busy' : '🔴 Offline';
      await bot.sendMessage(chatId, `📊 Your Status: ${status}`);
    } else {
      await bot.sendMessage(chatId, '❌ Partner not found. Please contact admin.');
    }
  } catch (error) {
    console.error('Error handling status command:', error);
  }
}

async function handleMenuCommand(msg: any) {
  const chatId = msg.chat.id;
  
  try {
    const partner = await prisma.deliveryPartner.findFirst({
      where: { telegramChatId: chatId.toString() }
    });

    if (partner) {
      const replyMarkup = {
        inline_keyboard: [
          [{ text: '📦 View Active Orders', callback_data: 'view_orders' }],
          [{ text: '💰 View Earnings', callback_data: 'view_earnings' }],
          [{ text: '🔄 Toggle Status', callback_data: 'toggle_status' }]
        ]
      };

      await bot.sendMessage(chatId, "Here's your menu:", {
        reply_markup: replyMarkup
      });
    } else {
      await bot.sendMessage(chatId, '❌ Partner not found. Please contact admin.');
    }
  } catch (error) {
    console.error('Error handling menu command:', error);
  }
} 