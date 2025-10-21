/**
 * Toast notifications with haptic feedback
 * 
 * Wrapper around sonner toast that adds haptic feedback
 */

import { toast as sonnerToast } from 'sonner';
import { hapticSuccess, hapticError, hapticWarning } from '@/haptics';

export const toast = {
  success: (message: string, options?: Parameters<typeof sonnerToast.success>[1]) => {
    hapticSuccess();
    return sonnerToast.success(message, options);
  },
  
  error: (message: string, options?: Parameters<typeof sonnerToast.error>[1]) => {
    hapticError();
    return sonnerToast.error(message, options);
  },
  
  warning: (message: string, options?: Parameters<typeof sonnerToast.warning>[1]) => {
    hapticWarning();
    return sonnerToast.warning(message, options);
  },
  
  info: (message: string, options?: Parameters<typeof sonnerToast.info>[1]) => {
    // No haptic for info
    return sonnerToast.info(message, options);
  },
  
  message: (message: string, options?: Parameters<typeof sonnerToast.message>[1]) => {
    // No haptic for plain message
    return sonnerToast.message(message, options);
  },
  
  // Pass through other toast methods
  promise: sonnerToast.promise,
  custom: sonnerToast.custom,
  dismiss: sonnerToast.dismiss,
  loading: sonnerToast.loading,
};

