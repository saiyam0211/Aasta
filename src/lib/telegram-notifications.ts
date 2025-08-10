import { getTelegramBot } from './telegram-bot-integration';
import { prisma } from './prisma';

export async function sendTelegramNotification(
  phoneNumber: string,
  message: string
): Promise<boolean> {
  try {
    const botService = getTelegramBot();
    if (!botService) {
      console.warn('Telegram bot not available for notification');
      return false;
    }

    // Find the delivery partner by phone number
    const partner = await prisma.deliveryPartner.findFirst({
      where: { 
        OR: [
          { telegramPhone: phoneNumber },
          { user: { phone: phoneNumber } }
        ]
      }
    });

    if (!partner || !partner.telegramChatId) {
      console.warn(`No Telegram chat ID found for phone: ${phoneNumber}`);
      return false;
    }

    await botService.bot.sendMessage(partner.telegramChatId, message);
    console.log(`Telegram notification sent to ${phoneNumber}`);
    return true;
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
    return false;
  }
}

export async function sendOrderNotificationToPartner(
  phoneNumber: string,
  orderId: string,
  orderNumber: string,
  restaurantName: string,
  customerName: string,
  totalAmount: number,
  verificationCode: string
): Promise<boolean> {
  const message = `🚚 New Order Alert!

📦 Order #${orderNumber}
🏪 Restaurant: ${restaurantName}
👤 Customer: ${customerName}
💰 Amount: ₹${totalAmount}
🔢 Verification Code: ${verificationCode}

Please accept or decline this order.`;

  return await sendTelegramNotification(phoneNumber, message);
}

export async function sendBatchNotificationToPartner(
  phoneNumber: string,
  batchId: string,
  ordersCount: number,
  totalAmount: number
): Promise<boolean> {
  const message = `📦 New Delivery Batch!

🆔 Batch ID: ${batchId}
📦 Orders: ${ordersCount}
💰 Total Amount: ₹${totalAmount}

You have been assigned this delivery batch. Please review and confirm.`;

  return await sendTelegramNotification(phoneNumber, message);
} 