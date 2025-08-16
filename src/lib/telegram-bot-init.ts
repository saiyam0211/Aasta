import { forceInitializeBot } from './telegram-bot-integration';

// Initialize bot immediately only if explicitly enabled
if (typeof window === 'undefined') {
	const enable = process.env.ENABLE_TELEGRAM_BOT === 'true';
	if (enable) {
		forceInitializeBot().catch(console.error);
	}
}

export { forceInitializeBot };
