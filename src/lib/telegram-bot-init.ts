import { forceInitializeBot } from './telegram-bot-integration';

// Initialize bot immediately when this module is imported
if (typeof window === 'undefined') {
  // Only run on server side
  forceInitializeBot().catch(console.error);
}

export { forceInitializeBot }; 