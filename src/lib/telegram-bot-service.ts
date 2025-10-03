import TelegramBot from 'node-telegram-bot-api';
import { prisma } from '@/lib/prisma';

export class TelegramBotService {
  public bot: TelegramBot;

  constructor(token: string) {
    this.bot = new TelegramBot(token, { polling: true });

    // Set up the persistent menu commands
    this.setupPersistentMenu();

    // Bind commands
    this.bot.onText(/\/start/, this.handleStartCommand);
    this.bot.onText(/\/menu/, this.handleMenuCommand);
    this.bot.onText(/\/orders/, this.handleOrdersCommand);
    this.bot.onText(/\/earnings/, this.handleEarningsCommand);
    this.bot.onText(/\/status/, this.handleStatusCommand);
    this.bot.onText(/\/toggle/, this.handleToggleStatusCommand);

    // Handle contact sharing
    this.bot.on('contact', this.handleContact);

    // Handle callback queries for inline buttons (order accept/decline)
    this.bot.on('callback_query', this.handleCallbackQuery);

    // Handle any text message to show persistent menu
    this.bot.on('message', this.handleTextMessage);
  }

  private setupPersistentMenu = async () => {
    try {
      // Set bot commands for the persistent menu
      await this.bot.setMyCommands([
        {
          command: 'menu',
          description: '📱 Main Menu - Toggle status, view orders & earnings',
        },
        { command: 'status', description: '📊 View current status' },
        {
          command: 'toggle',
          description: '🔄 Toggle between Available/Offline',
        },
        { command: 'orders', description: '📦 View active orders' },
        { command: 'earnings', description: '💰 View earnings summary' },
      ]);
      console.log('Persistent menu commands set successfully');
    } catch (error) {
      console.error('Failed to set persistent menu commands:', error);
    }
  };

  private handleStartCommand = async (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;

    try {
      // Check if user is already registered
      const existingPartner = await prisma.deliveryPartner.findFirst({
        where: {
          telegramChatId: chatId.toString(),
        },
        include: {
          user: { select: { name: true } },
        },
      });

      if (existingPartner) {
        // User is already registered
        const welcomeMessage = `🚚 Welcome back, ${existingPartner.user?.name || 'Partner'}!

✅ Your account is verified and ready to receive orders.

📋 Available commands:
/orders - View active orders
/status - Check your status
/earnings - View earnings

You'll receive notifications here when new orders are assigned to you!`;

        await this.sendMainMenu(
          chatId,
          `🚚 Welcome back, ${existingPartner.user?.name || 'Partner'}!`
        );
      } else {
        // New user - needs to register
        const welcomeMessage = `🚚 Welcome to Aasta Delivery!

To complete your registration, please:
1. Share your phone number using the button below
2. Make sure your admin has added you as a delivery partner

Once registered, you'll receive order notifications here!`;

        // Send welcome message with phone sharing button
        await this.bot.sendMessage(chatId, welcomeMessage, {
          reply_markup: {
            keyboard: [
              [
                {
                  text: '📱 Share Phone Number',
                  request_contact: true,
                },
              ],
            ],
            one_time_keyboard: true,
            resize_keyboard: true,
          },
        });
      }

      console.log(`User started bot: Chat ID ${chatId}`);
    } catch (error) {
      console.error('Error handling start command:', error);
    }
  };

  private handleOrdersCommand = async (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;

    try {
      // Get active orders for this delivery partner
      const partner = await prisma.deliveryPartner.findFirst({
        where: { telegramChatId: chatId.toString() },
      });

      if (!partner) {
        await this.bot.sendMessage(
          chatId,
          '❌ You are not registered as a delivery partner.'
        );
        return;
      }

      const activeOrders = await prisma.order.findMany({
        where: {
          deliveryPartnerId: partner.id,
          status: {
            in: [
              'CONFIRMED',
              'PREPARING',
              'READY_FOR_PICKUP',
              'OUT_FOR_DELIVERY',
            ],
          },
        },
        include: {
          restaurant: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (activeOrders.length === 0) {
        await this.bot.sendMessage(
          chatId,
          '📋 No active orders at the moment.'
        );
      } else {
        let message = '📋 Your Active Orders:\n\n';
        activeOrders.forEach((order, index) => {
          message += `${index + 1}. Order #${order.orderNumber}\n`;
          message += `   Restaurant: ${order.restaurant.name}\n`;
          message += `   Status: ${order.status}\n`;
          message += `   Total: ₹${order.totalAmount}\n\n`;
        });
        await this.bot.sendMessage(chatId, message);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      await this.bot.sendMessage(
        chatId,
        '❌ Failed to fetch orders. Please try again.'
      );
    }
  };

  private handleAcceptCommand = (
    msg: TelegramBot.Message,
    match: RegExpExecArray | null
  ) => {
    const chatId = msg.chat.id;
    const orderId = match ? match[1] : null;
    if (orderId) {
      this.bot.sendMessage(chatId, `Order #${orderId} accepted.`);
    } else {
      this.bot.sendMessage(chatId, 'Error: Invalid order id.');
    }
  };

  private handleRejectCommand = (
    msg: TelegramBot.Message,
    match: RegExpExecArray | null
  ) => {
    const chatId = msg.chat.id;
    const orderId = match ? match[1] : null;
    if (orderId) {
      this.bot.sendMessage(chatId, `Order #${orderId} rejected.`);
    } else {
      this.bot.sendMessage(chatId, 'Error: Invalid order id.');
    }
  };

  private handleStatusCommand = async (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;

    try {
      const partner = await prisma.deliveryPartner.findFirst({
        where: { telegramChatId: chatId.toString() },
        include: {
          user: { select: { name: true } },
        },
      });

      if (!partner) {
        await this.bot.sendMessage(
          chatId,
          '❌ You are not registered as a delivery partner.'
        );
        return;
      }

      const statusMessage = `📊 Your Status:

👤 Name: ${partner.user?.name || 'N/A'}
🚦 Status: ${partner.status}
💰 Today's Earnings: ₹${partner.todayEarnings}
📦 Completed Deliveries: ${partner.completedDeliveries}
⭐ Rating: ${partner.rating}/5`;

      await this.bot.sendMessage(chatId, statusMessage);
    } catch (error) {
      console.error('Error fetching status:', error);
      await this.bot.sendMessage(
        chatId,
        '❌ Failed to fetch status. Please try again.'
      );
    }
  };

  private handleEarningsCommand = async (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;

    try {
      const partner = await prisma.deliveryPartner.findFirst({
        where: { telegramChatId: chatId.toString() },
      });

      if (!partner) {
        await this.bot.sendMessage(
          chatId,
          '❌ You are not registered as a delivery partner.'
        );
        return;
      }

      const earningsMessage = `💰 Your Earnings:

📅 Today: ₹${partner.todayEarnings}
🏦 Total: ₹${partner.totalEarnings}
📦 Completed Deliveries: ${partner.completedDeliveries}
📈 Average per delivery: ₹${partner.completedDeliveries > 0 ? (partner.totalEarnings / partner.completedDeliveries).toFixed(2) : '0'}`;

      await this.bot.sendMessage(chatId, earningsMessage);
    } catch (error) {
      console.error('Error fetching earnings:', error);
      await this.bot.sendMessage(
        chatId,
        '❌ Failed to fetch earnings. Please try again.'
      );
    }
  };

  private handleContact = async (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;
    const contact = msg.contact;

    if (contact && contact.phone_number) {
      try {
        // Normalize phone number to different formats for search
        const normalizedPhone = contact.phone_number.replace(/\s+/g, '');
        const phoneVariations = [
          contact.phone_number, // Original format from Telegram
          normalizedPhone, // Remove spaces
          '+' + normalizedPhone, // Add + prefix
          '+91 ' + normalizedPhone.substring(2), // Convert 918901825390 to +91 8901825390
          '+91' + normalizedPhone.substring(2), // Convert 918901825390 to +918901825390
          normalizedPhone.substring(2), // Remove country code: 918901825390 to 8901825390
        ];

        // Find the delivery partner by phone number (try different formats)
        let deliveryPartner = null;
        for (const phoneVariation of phoneVariations) {
          deliveryPartner = await prisma.deliveryPartner.findFirst({
            where: { telegramPhone: phoneVariation },
          });
          if (deliveryPartner) {
            console.log(
              `Telegram contact registered: ${contact.phone_number} matched with format: ${phoneVariation}`
            );
            break;
          }
        }

        if (deliveryPartner) {
          // Update with chat ID
          await prisma.deliveryPartner.update({
            where: { id: deliveryPartner.id },
            data: { telegramChatId: chatId.toString() },
          });

          await this.sendMainMenu(
            chatId,
            '✅ Your phone number has been registered successfully! You will now receive order notifications here.'
          );
          // Remove the phone sharing keyboard by sending main menu
          console.log(
            `Telegram chat ID registered: ${chatId} for phone: ${contact.phone_number}`
          );
        } else {
          await this.bot.sendMessage(
            chatId,
            '❌ Phone number not found. Please contact your admin to add you as a delivery partner first.'
          );
        }
      } catch (error) {
        console.error('Failed to register contact:', error);
        await this.bot.sendMessage(
          chatId,
          '❌ Failed to register your phone number. Please try again or contact support.'
        );
      }
    } else {
      await this.bot.sendMessage(
        chatId,
        'Please share your contact information to register.'
      );
    }
  };

  private handleToggleStatusCommand = async (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;

    try {
      const partner = await prisma.deliveryPartner.findFirst({
        where: { telegramChatId: chatId.toString() },
      });
      if (!partner) {
        await this.bot.sendMessage(
          chatId,
          '❌ You are not registered as a delivery partner.'
        );
        return;
      }

      const newStatus =
        partner.status === 'AVAILABLE' ? 'OFFLINE' : 'AVAILABLE';
      await prisma.deliveryPartner.update({
        where: { id: partner.id },
        data: { status: newStatus },
      });

      await this.bot.sendMessage(
        chatId,
        `🚦 Your status has been changed to ${newStatus}.`
      );
    } catch (error) {
      console.error('Error toggling status:', error);
      await this.bot.sendMessage(
        chatId,
        '❌ Failed to toggle status. Please try again.'
      );
    }
  };

  private handleTextMessage = async (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Handle button text messages
    if (text && !text.startsWith('/') && !msg.contact) {
      // Check if user is registered
      const partner = await prisma.deliveryPartner.findFirst({
        where: { telegramChatId: chatId.toString() },
      });

      if (!partner) {
        await this.bot.sendMessage(
          chatId,
          '❌ You are not registered as a delivery partner.'
        );
        return;
      }

      // Handle button presses
      switch (text) {
        case '📱 Menu':
          await this.handleMenuCommand(msg);
          break;
        case '📦 View Orders':
          await this.handleOrdersCommand(msg);
          break;
        case '💰 View Earnings':
          await this.handleEarningsCommand(msg);
          break;
        case '🔄 Toggle Status':
          await this.handleToggleStatusCommand(msg);
          break;
        case '📊 View Status':
          await this.handleStatusCommand(msg);
          break;
        default:
          await this.bot.sendMessage(
            chatId,
            'Please tap 📱 Menu button below or type /menu for available options.'
          );
      }
    }
  };

  private showMainMenu = async (chatId: number, messageId?: number) => {
    const replyMarkup = {
      inline_keyboard: [
        [{ text: '📦 View Active Orders', callback_data: 'view_orders' }],
        [{ text: '💰 View Earnings', callback_data: 'view_earnings' }],
        [{ text: '🔄 Toggle Status', callback_data: 'toggle_status' }],
      ],
    };

    const text = "Here's your menu:";

    if (messageId) {
      await this.bot.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: replyMarkup,
      });
    } else {
      await this.bot.sendMessage(chatId, text, {
        reply_markup: replyMarkup,
      });
    }
  };

  private handleToggleStatus = async (chatId: number, messageId?: number) => {
    try {
      const partner = await prisma.deliveryPartner.findFirst({
        where: { telegramChatId: chatId.toString() },
      });
      if (!partner) {
        await this.bot.sendMessage(
          chatId,
          '❌ You are not registered as a delivery partner.'
        );
        return;
      }

      const newStatus =
        partner.status === 'AVAILABLE' ? 'OFFLINE' : 'AVAILABLE';
      await prisma.deliveryPartner.update({
        where: { id: partner.id },
        data: { status: newStatus },
      });

      const statusEmoji = newStatus === 'AVAILABLE' ? '🟢' : '🔴';
      const confirmMessage = `${statusEmoji} *Status Updated!*\n\nYou are now *${newStatus}*\n\n${newStatus === 'AVAILABLE' ? '✅ You will receive new order notifications' : '⏸️ You will not receive new order notifications'}`;

      if (messageId) {
        await this.bot.editMessageText(confirmMessage, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔙 Back to Menu', callback_data: 'back_to_menu' }],
            ],
          },
        });
      } else {
        await this.bot.sendMessage(chatId, confirmMessage, {
          parse_mode: 'Markdown',
        });
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      await this.bot.sendMessage(
        chatId,
        '❌ Failed to toggle status. Please try again.'
      );
    }
  };

  private handleViewEarnings = async (chatId: number, messageId?: number) => {
    try {
      const partner = await prisma.deliveryPartner.findFirst({
        where: { telegramChatId: chatId.toString() },
      });
      if (!partner) {
        await this.bot.sendMessage(
          chatId,
          '❌ You are not registered as a delivery partner.'
        );
        return;
      }

      const averageEarning =
        partner.completedDeliveries > 0
          ? (partner.totalEarnings / partner.completedDeliveries).toFixed(2)
          : '0';

      const earningsMessage = `💰 *EARNINGS SUMMARY*\n\n📅 *Today:* ₹${partner.todayEarnings}\n🏦 *Total:* ₹${partner.totalEarnings}\n📦 *Completed Deliveries:* ${partner.completedDeliveries}\n📈 *Average per delivery:* ₹${averageEarning}\n\n⭐ *Your Rating:* ${partner.rating}/5`;

      if (messageId) {
        await this.bot.editMessageText(earningsMessage, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔙 Back to Menu', callback_data: 'back_to_menu' }],
            ],
          },
        });
      } else {
        await this.bot.sendMessage(chatId, earningsMessage, {
          parse_mode: 'Markdown',
        });
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
      await this.bot.sendMessage(
        chatId,
        '❌ Failed to fetch earnings. Please try again.'
      );
    }
  };

  private handleViewOrders = async (chatId: number, messageId?: number) => {
    try {
      const partner = await prisma.deliveryPartner.findFirst({
        where: { telegramChatId: chatId.toString() },
      });
      if (!partner) {
        await this.bot.sendMessage(
          chatId,
          '❌ You are not registered as a delivery partner.'
        );
        return;
      }

      const activeOrders = await prisma.order.findMany({
        where: {
          deliveryPartnerId: partner.id,
          status: {
            in: [
              'CONFIRMED',
              'PREPARING',
              'READY_FOR_PICKUP',
              'OUT_FOR_DELIVERY',
            ],
          },
        },
        include: {
          restaurant: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      let ordersMessage = '';
      if (activeOrders.length === 0) {
        ordersMessage =
          "📋 *ACTIVE ORDERS*\n\n🆓 No active orders at the moment.\n\nYou're all caught up! 🎉";
      } else {
        ordersMessage = `📋 *ACTIVE ORDERS* (${activeOrders.length})\n\n`;
        activeOrders.forEach((order, index) => {
          const statusEmoji =
            order.status === 'CONFIRMED'
              ? '✅'
              : order.status === 'PREPARING'
                ? '👨‍🍳'
                : order.status === 'READY_FOR_PICKUP'
                  ? '📦'
                  : '🚚';
          ordersMessage += `${index + 1}. ${statusEmoji} *Order #${order.orderNumber}*\n`;
          ordersMessage += `   🏪 ${order.restaurant.name}\n`;
          ordersMessage += `   📋 Status: ${order.status}\n`;
          ordersMessage += `   💰 Total: ₹${order.totalAmount}\n\n`;
        });
      }

      if (messageId) {
        await this.bot.editMessageText(ordersMessage, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔙 Back to Menu', callback_data: 'back_to_menu' }],
            ],
          },
        });
      } else {
        await this.bot.sendMessage(chatId, ordersMessage, {
          parse_mode: 'Markdown',
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      await this.bot.sendMessage(
        chatId,
        '❌ Failed to fetch orders. Please try again.'
      );
    }
  };

  private handleMenuCommand = async (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;

    try {
      const partner = await prisma.deliveryPartner.findFirst({
        where: { telegramChatId: chatId.toString() },
        include: {
          user: { select: { name: true } },
        },
      });

      if (!partner) {
        await this.bot.sendMessage(
          chatId,
          '❌ You are not registered as a delivery partner.'
        );
        return;
      }

      // Get total orders count
      const totalOrders = await prisma.order.count({
        where: { deliveryPartnerId: partner.id },
      });

      // Get active orders count
      const activeOrders = await prisma.order.count({
        where: {
          deliveryPartnerId: partner.id,
          status: {
            in: [
              'CONFIRMED',
              'PREPARING',
              'READY_FOR_PICKUP',
              'OUT_FOR_DELIVERY',
            ],
          },
        },
      });

      const statusEmoji =
        partner.status === 'AVAILABLE'
          ? '🟢'
          : partner.status === 'BUSY'
            ? '🟡'
            : '🔴';

      const menuMessage = `📱 *DELIVERY PARTNER MENU*

👤 *${partner.user?.name || 'Partner'}*
${statusEmoji} Status: *${partner.status}*

📊 *Quick Stats:*
💰 Today's Earnings: ₹${partner.todayEarnings}
💳 Total Earnings: ₹${partner.totalEarnings}
📦 Active Orders: ${activeOrders}
📋 Total Orders: ${totalOrders}
⭐ Rating: ${partner.rating}/5

*Choose an option below:*`;

      await this.bot.sendMessage(chatId, menuMessage, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text:
                  partner.status === 'AVAILABLE'
                    ? '🔴 Go Offline'
                    : '🟢 Go Available',
                callback_data: 'toggle_status',
              },
            ],
            [
              { text: '📦 View Orders', callback_data: 'view_orders' },
              { text: '💰 View Earnings', callback_data: 'view_earnings' },
            ],
            [{ text: '📊 Detailed Status', callback_data: 'detailed_status' }],
          ],
        },
      });
    } catch (error) {
      console.error('Error showing menu:', error);
      await this.bot.sendMessage(
        chatId,
        '❌ Failed to load menu. Please try again.'
      );
    }
  };

  private sendMainMenu = async (chatId: number, welcomeText: string) => {
    const replyMarkup = {
      keyboard: [[{ text: '📱 Menu' }]],
      resize_keyboard: true,
      persistent: true,
    };

    await this.bot.sendMessage(
      chatId,
      `${welcomeText}\n\nTap 📱 Menu button below or type /menu anytime to access all features:`,
      {
        reply_markup: replyMarkup,
      }
    );
  };

  private handleCallbackQuery = async (
    callbackQuery: TelegramBot.CallbackQuery
  ) => {
    const chatId = callbackQuery.message?.chat.id;
    const messageId = callbackQuery.message?.message_id;
    const data = callbackQuery.data || '';

    // Return early if essential data is missing
    if (!chatId || !messageId) {
      console.error('Missing chatId or messageId in callback query');
      return;
    }

    try {
      if (data.startsWith('accept_')) {
        const orderId = data.split('_')[1];
        console.log(
          `Order ${orderId} accepted by partner with chat ID ${chatId}.`
        );

        // Check if order is still available (not already accepted by someone else)
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: {
            restaurant: {
              select: {
                name: true,
                assignedDeliveryPartners: true,
              },
            },
          },
        });

        if (!order) {
          await this.bot.editMessageText(`❌ Order not found.`, {
            chat_id: chatId,
            message_id: messageId,
          });
          await this.bot.answerCallbackQuery(callbackQuery.id);
          return;
        }

        if (order.deliveryPartnerId) {
          // Order already accepted by someone else
          await this.bot.editMessageText(
            `⚠️ This order has already been accepted by another delivery partner.`,
            { chat_id: chatId, message_id: messageId }
          );
          await this.bot.answerCallbackQuery(callbackQuery.id);
          return;
        }

        // Get the accepting partner
        const acceptingPartner = await prisma.deliveryPartner.findFirst({
          where: { telegramChatId: chatId?.toString() },
        });

        if (!acceptingPartner) {
          await this.bot.editMessageText(`❌ Partner not found.`, {
            chat_id: chatId,
            message_id: messageId,
          });
          await this.bot.answerCallbackQuery(callbackQuery.id);
          return;
        }

        // Assign order to this partner
        await prisma.order.update({
          where: { id: orderId },
          data: {
            deliveryPartnerId: acceptingPartner.id,
            status: 'CONFIRMED',
          },
        });

        // Update partner status to BUSY
        await prisma.deliveryPartner.update({
          where: { id: acceptingPartner.id },
          data: { status: 'BUSY' },
        });

        // Cancel notifications for all OTHER partners assigned to this restaurant
        const otherPartners = await prisma.deliveryPartner.findMany({
          where: {
            AND: [
              { id: { in: order.restaurant.assignedDeliveryPartners } },
              { telegramChatId: { not: null } },
              { id: { not: acceptingPartner.id } }, // Exclude the accepting partner
            ],
          },
        });

        // Send cancellation messages to other partners
        for (const partner of otherPartners) {
          if (partner.telegramChatId) {
            try {
              await this.bot.sendMessage(
                parseInt(partner.telegramChatId),
                `⚠️ Order #${order.orderNumber} has been accepted by another delivery partner and is no longer available.`
              );
            } catch (error) {
              console.error(
                `Failed to send cancellation to partner ${partner.id}:`,
                error
              );
            }
          }
        }

        // Get full order details for the acceptance message
        const fullOrder = await prisma.order.findUnique({
          where: { id: orderId },
          include: {
            restaurant: {
              select: {
                name: true,
                address: true,
                latitude: true,
                longitude: true,
              },
            },
            deliveryAddress: true,
            customer: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            orderItems: {
              include: {
                menuItem: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        });

        if (fullOrder) {
          const restaurantMapsLink = `https://www.google.com/maps/search/?api=1&query=${fullOrder.restaurant.latitude},${fullOrder.restaurant.longitude}`;
          const customerMapsLink = `https://www.google.com/maps/search/?api=1&query=${fullOrder.deliveryAddress?.latitude || 0},${fullOrder.deliveryAddress?.longitude || 0}`;

          const orderItemsList = fullOrder.orderItems
            .map((item) => `• ${item.quantity}x ${item.menuItem.name}`)
            .join('\n');

          const acceptanceMessage = `✅ *ORDER ACCEPTED!*

📋 *Order Details:*
Order ID: \`${fullOrder.orderNumber}\`
Restaurant: *${fullOrder.restaurant.name}*
Customer: *${fullOrder.customer.user?.name || 'Anonymous'}*
Total Amount: *₹${fullOrder.totalAmount}*

🛒 *Items:*
${orderItemsList}

🔐 *Verification Code: \`${fullOrder.verificationCode}\`*
_(Show this to restaurant staff for pickup)_

📍 *Pickup Location:*
${fullOrder.restaurant.address}
[📍 Open in Google Maps](${restaurantMapsLink})

🏠 *Delivery Location:*
${fullOrder.deliveryAddress 
  ? `${fullOrder.deliveryAddress.street}, ${fullOrder.deliveryAddress.city}`
  : 'Pickup at restaurant'}
[📍 Open in Google Maps](${customerMapsLink})

📋 *Next Steps:*
1. Go to restaurant for pickup
2. Show verification code to staff
3. Pick up the order
4. Deliver to customer
5. Click "Mark as Delivered" when done`;

          // Confirm acceptance to the accepting partner with detailed info and Mark as Delivered button
          await this.bot.editMessageText(acceptanceMessage, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '🛑 Mark as Delivered',
                    callback_data: `deliver_${orderId}`,
                  },
                ],
              ],
            },
          });
        } else {
          // Fallback message if order details can't be retrieved
          await this.bot.editMessageText(
            `✅ Order accepted! You can now proceed to the restaurant for pickup.

📋 Next Steps:
1. Go to ${order.restaurant.name} for pickup
2. Show the verification code to restaurant staff
3. Confirm pickup and start delivery

Use /orders to view order details.`,
            {
              chat_id: chatId,
              message_id: messageId,
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: '🛑 Mark as Delivered',
                      callback_data: `deliver_${orderId}`,
                    },
                  ],
                ],
              },
            }
          );
        }

        console.log(
          `Order ${order.orderNumber} assigned to partner ${acceptingPartner.id}, cancellation sent to ${otherPartners.length} other partners`
        );
      } else if (data.startsWith('deliver_')) {
        const orderId = data.split('_')[1];
        console.log(
          `Order ${orderId} marked as delivered by partner with chat ID ${chatId}.`
        );

        // Get the order first to access deliveryFee
        const orderToDeliver = await prisma.order.findUnique({
          where: { id: orderId },
        });

        if (!orderToDeliver) {
          await this.bot.editMessageText(`❌ Order not found.`, {
            chat_id: chatId,
            message_id: messageId,
          });
          await this.bot.answerCallbackQuery(callbackQuery.id);
          return;
        }

        // Mark the order as delivered
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'DELIVERED' },
        });

        // Update the delivery partner's status to AVAILABLE and add delivery fee to earnings
        const partner = await prisma.deliveryPartner.findFirst({
          where: { telegramChatId: chatId?.toString() },
        });

        if (partner) {
          await prisma.deliveryPartner.update({
            where: { id: partner.id },
            data: {
              status: 'AVAILABLE',
              todayEarnings: { increment: orderToDeliver.deliveryFee },
              totalEarnings: { increment: orderToDeliver.deliveryFee },
              completedDeliveries: { increment: 1 },
            },
          });
        }

        await this.bot.editMessageText(
          `✅ Order marked as delivered! You earned ₹${orderToDeliver.deliveryFee} from this delivery. Your status is now AVAILABLE.`,
          { chat_id: chatId, message_id: messageId }
        );

        console.log(
          `Order ${orderId} marked as delivered by partner ${partner?.id}, earnings updated with ₹${orderToDeliver.deliveryFee}.`
        );
      } else if (data.startsWith('decline_')) {
        const orderId = data.split('_')[1];
        console.log(
          `Order ${orderId} declined by partner with chat ID ${chatId}.`
        );

        // Update the order to mark it as declined by the delivery partner
        await prisma.order.update({
          where: { id: orderId },
          data: {
            cancelReason: 'DELIVERY_PARTNER_DECLINED',
          },
        });

        await this.bot.editMessageText(
          `❌ Order declined. The order remains available for other delivery partners.`,
          { chat_id: chatId, message_id: messageId }
        );
      }

      // Acknowledge callback to avoid error
      // Handle main menu actions
      else if (data === 'toggle_status') {
        await this.handleToggleStatus(chatId, messageId);
      } else if (data === 'view_earnings') {
        await this.handleViewEarnings(chatId, messageId);
      } else if (data === 'view_orders') {
        await this.handleViewOrders(chatId, messageId);
      } else if (data === 'detailed_status') {
        await this.handleToggleStatus(chatId);
      } else if (data === 'back_to_menu') {
        // Go back to main menu
        const partner = await prisma.deliveryPartner.findFirst({
          where: { telegramChatId: chatId.toString() },
          include: { user: { select: { name: true } } },
        });
        if (partner) {
          await this.handleMenuCommand({
            chat: { id: chatId },
          } as TelegramBot.Message);
        }
      }

      await this.bot.answerCallbackQuery(callbackQuery.id);
    } catch (error) {
      console.error('Failed to handle callback query:', error);
      await this.bot.answerCallbackQuery(callbackQuery.id, {
        text: 'An error occurred. Please try again.',
      });
    }
  };

  public async sendOrderNotificationWithDetails(
    phoneNumber: string,
    orderId: string,
    orderNumber: string,
    restaurantName: string,
    restaurantAddress: string,
    customerName: string,
    totalAmount: number,
    verificationCode: string,
    restaurantLat: number,
    restaurantLng: number,
    customerLat: number,
    customerLng: number,
    customerAddress: string,
    itemsCount: number
  ): Promise<void> {
    try {
      // Find delivery partner by phone number and get their chat ID
      const deliveryPartner = await prisma.deliveryPartner.findFirst({
        where: {
          telegramPhone: phoneNumber,
          telegramChatId: { not: null },
        },
      });

      if (!deliveryPartner?.telegramChatId) {
        console.log(
          `No chat ID found for phone number ${phoneNumber}. Partner needs to start the bot first.`
        );
        return;
      }

      const restaurantMapsLink = `https://www.google.com/maps/search/?api=1&query=${restaurantLat},${restaurantLng}`;
      const customerMapsLink = `https://www.google.com/maps/search/?api=1&query=${customerLat},${customerLng}`;

      const message = `🍽️ *NEW ORDER ASSIGNED!*

📋 *Order Details:*
Order ID: \`${orderNumber}\`
Restaurant: *${restaurantName}*
Customer: *${customerName}*
Items: ${itemsCount} items
Total Amount: *₹${totalAmount}*

🔐 *Verification Code: \`${verificationCode}\`*
_(Show this to restaurant staff for pickup)_

📍 *Pickup Location:*
${restaurantAddress}
[📍 Open in Google Maps](${restaurantMapsLink})

🏠 *Delivery Location:*
${customerAddress}
[📍 Open in Google Maps](${customerMapsLink})

Please choose your response:`;

      await this.bot.sendMessage(
        parseInt(deliveryPartner.telegramChatId),
        message,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '✅ Accept Order', callback_data: `accept_${orderId}` }],
              [
                {
                  text: '❌ Decline Order',
                  callback_data: `decline_${orderId}`,
                },
              ],
            ],
          },
        }
      );

      console.log(
        `Enhanced order notification sent for order ${orderNumber} to partner ${deliveryPartner.id}`
      );
    } catch (error) {
      console.error(
        `Failed to send order notification to phone ${phoneNumber}:`,
        error
      );
    }
  }

  public async sendMessageByPhone(
    phoneNumber: string,
    message: string
  ): Promise<any> {
    try {
      // Find delivery partner by phone number and get their chat ID
      const deliveryPartner = await prisma.deliveryPartner.findFirst({
        where: {
          telegramPhone: phoneNumber,
          telegramChatId: { not: null },
        },
      });

      if (deliveryPartner?.telegramChatId) {
        await this.bot.sendMessage(
          parseInt(deliveryPartner.telegramChatId),
          message
        );
        console.log(`Telegram message sent successfully to ${phoneNumber}`);
      } else {
        console.log(
          `No chat ID found for phone number ${phoneNumber}. Partner needs to start the bot first.`
        );
      }
    } catch (error) {
      console.error(`Failed to send message to phone ${phoneNumber}:`, error);
    }
  }

  public async sendOrderNotification(
    orderId: string,
    details: string
  ): Promise<void> {
    try {
      // Find delivery partner for the order
      const partner = await prisma.deliveryPartner.findFirst({
        where: {
          orders: {
            some: {
              id: orderId,
            },
          },
        },
        include: {
          user: true,
        },
      });

      if (partner && partner.telegramPhone) {
        const message = `New Order Received:\n\n${details}`;
        await this.sendMessageByPhone(partner.telegramPhone, message);
      } else {
        console.error('No partner or Telegram chat ID found for this order.');
      }
    } catch (error) {
      console.error('Failed to send order notification:', error);
    }
  }

  public async sendBatchNotification(
    batchId: string,
    details: string
  ): Promise<void> {
    try {
      // Find partners for the batch
      const batch = await prisma.deliveryBatch.findUnique({
        where: { id: batchId },
        include: {
          deliveryPartner: {
            select: {
              telegramPhone: true,
            },
          },
        },
      });

      if (batch && batch.deliveryPartner.telegramPhone) {
        const message = `Batch Delivery Details:\n\n${details}`;
        await this.sendMessageByPhone(
          batch.deliveryPartner.telegramPhone,
          message
        );
      } else {
        console.error('No Telegram chat ID found for this batch.');
      }
    } catch (error) {
      console.error('Failed to send batch notification:', error);
    }
  }
}
