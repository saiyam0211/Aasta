# Deployment Guide - Aasta Night Delivery with Telegram Bot

This guide explains how to deploy your Next.js app with the integrated Telegram bot service.

## 🚀 Quick Deployment Options

### 1. **Vercel (Recommended)**

**Why Vercel?**
- Perfect for Next.js apps
- Automatic deployments from GitHub
- Built-in environment variable management
- Free tier available

**Steps:**
1. **Connect your GitHub repository** to Vercel
2. **Add environment variables** in Vercel dashboard:
   ```
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   DATABASE_URL=your_database_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=https://your-domain.vercel.app
   ```
3. **Deploy** - Vercel will automatically build and deploy your app
4. **The Telegram bot will start automatically** when the app starts

### 2. **Railway**

**Why Railway?**
- Great for Node.js services
- Automatic deployments
- Good free tier
- Easy database integration

**Steps:**
1. **Create a Railway account** and connect your repository
2. **Add environment variables**:
   ```
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   DATABASE_URL=your_database_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=https://your-app.railway.app
   ```
3. **Deploy** - Railway will automatically start your app with the bot

### 3. **Render**

**Why Render?**
- Free tier available
- Simple setup
- Good for small to medium apps

**Steps:**
1. **Create a Render account** and connect your repository
2. **Create a new Web Service**
3. **Configure:**
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**: Add all required env vars
4. **Deploy** - Render will keep your app running 24/7

## 🔧 Environment Variables Required

Make sure to set these environment variables in your deployment platform:

```bash
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather

# Database
DATABASE_URL=your_postgresql_connection_string

# NextAuth
NEXTAUTH_SECRET=your_random_secret_key
NEXTAUTH_URL=https://your-domain.com

# Google Maps (if using)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Other services (if using)
REDIS_URL=your_redis_connection_string
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

## 🤖 Telegram Bot Setup

### 1. **Get Bot Token**
1. Message @BotFather on Telegram
2. Send `/newbot`
3. Follow instructions to create your bot
4. Copy the bot token

### 2. **Set Webhook (Optional)**
If you want to use webhooks instead of polling:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-domain.com/api/telegram-webhook"}'
```

## 📱 How the Integration Works

### **Development Mode**
```bash
npm run dev
```
- Starts Next.js development server
- Automatically initializes Telegram bot
- Bot runs in polling mode

### **Production Mode**
```bash
npm run build
npm start
```
- Builds the Next.js app
- Starts production server
- Telegram bot initializes automatically

### **Bot Features**
- **Automatic startup** when app starts
- **Graceful shutdown** when app stops
- **Order notifications** to delivery partners
- **Status management** for partners
- **Earnings tracking**

## 🔄 Deployment Workflow

### **Local Testing**
1. Set up environment variables in `.env.local`
2. Run `npm run dev`
3. Test bot functionality
4. Test web app functionality

### **Production Deployment**
1. Push code to GitHub
2. Deploy to your chosen platform
3. Set environment variables
4. Monitor logs for bot initialization
5. Test bot functionality

## 📊 Monitoring

### **Bot Status**
- Check logs for "✅ Telegram Bot integrated successfully"
- Monitor for any error messages
- Verify bot responds to commands

### **App Status**
- Monitor Next.js app logs
- Check database connectivity
- Verify API endpoints work

## 🛠️ Troubleshooting

### **Bot Not Starting**
1. Check `TELEGRAM_BOT_TOKEN` is set correctly
2. Verify bot token is valid
3. Check logs for initialization errors

### **Database Issues**
1. Verify `DATABASE_URL` is correct
2. Run `npm run db:generate` if needed
3. Check database connectivity

### **Deployment Issues**
1. Check build logs
2. Verify environment variables
3. Test locally first

## 🚀 Advanced Configuration

### **Custom Bot Commands**
Edit `src/lib/telegram-bot-service.ts` to add custom commands.

### **Webhook vs Polling**
- **Polling** (default): Bot checks for updates every few seconds
- **Webhook**: Telegram sends updates to your server

### **Scaling**
- For high traffic, consider separate bot deployment
- Use Redis for session management
- Implement rate limiting

## 📞 Support

If you encounter issues:
1. Check the logs in your deployment platform
2. Verify all environment variables are set
3. Test the bot token manually
4. Check database connectivity

---

**🎉 Your integrated Telegram bot and Next.js app are now ready for deployment!** 