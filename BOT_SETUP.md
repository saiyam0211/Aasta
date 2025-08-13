# Telegram Bot Setup Guide

## 🎉 Great News! Your Bot is Working!

Your Telegram bot is now successfully running! Here's what we've accomplished:

### ✅ **Bot Status**

- **Bot Name**: Aasta
- **Username**: @aasta_delivery_bot
- **Status**: Running and listening for messages
- **Token**: Configured and working

## 🚀 How to Use Your Bot

### **Option 1: Start Bot with Next.js App**

```bash
# Start both the web app and bot together
npm run dev:with-bot
```

### **Option 2: Start Bot Only (for development)**

```bash
# Start just the Telegram bot
npm run start:bot-only
```

### **Option 3: Manual Initialization**

```bash
# Start Next.js app normally
npm run dev

# Then manually initialize the bot
curl -X POST http://localhost:3000/api/init-bot
```

## 📱 Testing Your Bot

### **1. Find Your Bot**

1. Open Telegram
2. Search for `@aasta_delivery_bot`
3. Start a conversation with your bot

### **2. Test Bot Commands**

Send these messages to your bot:

- `/start` - Welcome message and registration
- `/status` - Check your delivery partner status
- `/menu` - Show main menu with options
- `/orders` - View active orders
- `/earnings` - View earnings summary

### **3. Check Bot Status via API**

```bash
curl http://localhost:3000/api/bot-status
```

Expected response:

```json
{
  "status": "running",
  "message": "Telegram bot is running",
  "botInfo": {
    "id": 8433207698,
    "username": "aasta_delivery_bot",
    "firstName": "Aasta"
  }
}
```

## 🔧 Bot Features

### **For Delivery Partners:**

- **Registration**: Share phone number to register
- **Status Management**: Toggle Available/Busy/Offline
- **Order Notifications**: Receive new order alerts
- **Earnings Tracking**: View daily and total earnings
- **Order Management**: Accept/decline orders

### **For Admins:**

- **Partner Management**: Add/remove delivery partners
- **Order Assignment**: Assign orders to partners
- **Notifications**: Send messages to partners

## 🛠️ Troubleshooting

### **Bot Not Responding?**

1. Check if bot is running:

   ```bash
   curl http://localhost:3000/api/bot-status
   ```

2. Manually initialize:

   ```bash
   curl -X POST http://localhost:3000/api/init-bot
   ```

3. Check environment variables:
   ```bash
   grep TELEGRAM_BOT_TOKEN .env
   ```

### **Common Issues:**

**Issue**: Bot not starting
**Solution**: Ensure `TELEGRAM_BOT_TOKEN` is set in `.env`

**Issue**: Bot not responding to commands
**Solution**: Check if you're messaging the correct bot (@aasta_delivery_bot)

**Issue**: Database connection errors
**Solution**: Run `npm run db:generate` and ensure database is running

## 📊 Monitoring

### **Check Bot Logs**

The bot will log its activities in the console:

- ✅ Bot initialization
- 📱 Message handling
- 🔄 Status changes
- 💰 Earnings updates

### **API Endpoints**

- `GET /api/bot-status` - Check bot status
- `POST /api/init-bot` - Manually initialize bot
- `POST /api/telegram-webhook` - Webhook endpoint (optional)

## 🚀 Deployment

### **For Production:**

1. **Deploy to Vercel/Railway/Render**
2. **Set environment variables**:
   ```
   TELEGRAM_BOT_TOKEN=your_bot_token
   DATABASE_URL=your_database_url
   ```
3. **Bot starts automatically** with the app

### **Environment Variables Required:**

```bash
TELEGRAM_BOT_TOKEN=8433207698:AAGozpDlsX080Oawpx0uSty51XuGfCfglgM
DATABASE_URL=your_database_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.com
```

## 🎯 Next Steps

1. **Test the bot** by sending `/start` to @aasta_delivery_bot
2. **Add delivery partners** through your admin panel
3. **Test order notifications** by creating test orders
4. **Deploy to production** when ready

## 📞 Support

If you need help:

1. Check the logs in your terminal
2. Test the bot status API endpoint
3. Verify environment variables are set
4. Make sure you're messaging the correct bot

---

**🎉 Your Telegram bot is ready to use! Start testing with `/start` command.**
