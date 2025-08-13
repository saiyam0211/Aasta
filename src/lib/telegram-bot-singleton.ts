import { TelegramBotService } from './telegram-bot-service';

class TelegramBotSingleton {
  private static instance: TelegramBotService | null = null;
  private static isInitializing = false;

  public static async getInstance(): Promise<TelegramBotService | null> {
    if (this.instance) {
      return this.instance;
    }

    if (this.isInitializing) {
      // Wait for initialization to complete
      while (this.isInitializing) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return this.instance;
    }

    this.isInitializing = true;

    try {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;

      if (!botToken) {
        console.warn(
          '⚠️ TELEGRAM_BOT_TOKEN not found. Telegram bot will not start.'
        );
        this.isInitializing = false;
        return null;
      }

      console.log('🚀 Initializing Telegram Bot Service...');
      this.instance = new TelegramBotService(botToken);

      // Set up graceful shutdown
      process.on('SIGINT', () => {
        console.log(
          '\n🛑 Received SIGINT, shutting down Telegram bot gracefully...'
        );
        if (this.instance) {
          this.instance.bot.stopPolling();
        }
      });

      process.on('SIGTERM', () => {
        console.log(
          '\n🛑 Received SIGTERM, shutting down Telegram bot gracefully...'
        );
        if (this.instance) {
          this.instance.bot.stopPolling();
        }
      });

      console.log('✅ Telegram Bot Service initialized successfully!');
      this.isInitializing = false;
      return this.instance;
    } catch (error) {
      console.error('❌ Failed to initialize Telegram Bot Service:', error);
      this.isInitializing = false;
      return null;
    }
  }

  public static getInstanceSync(): TelegramBotService | null {
    return this.instance;
  }

  public static async stopBot(): Promise<void> {
    if (this.instance) {
      console.log('🛑 Stopping Telegram bot...');
      this.instance.bot.stopPolling();
      this.instance = null;
    }
  }
}

export default TelegramBotSingleton;
