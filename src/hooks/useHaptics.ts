import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export const useHaptics = () => {
  const isNative = Capacitor.isNativePlatform();

  const light = async () => {
    if (isNative) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch (error) {
        // Silently fail if haptics not available
      }
    }
  };

  const medium = async () => {
    if (isNative) {
      try {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } catch (error) {
        // Silently fail if haptics not available
      }
    }
  };

  const heavy = async () => {
    if (isNative) {
      try {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } catch (error) {
        // Silently fail if haptics not available
      }
    }
  };

  const selection = async () => {
    if (isNative) {
      try {
        await Haptics.selectionStart();
      } catch (error) {
        // Silently fail if haptics not available
      }
    }
  };

  const notification = async (type: 'success' | 'warning' | 'error' = 'success') => {
    if (isNative) {
      try {
        await Haptics.notification({ 
          type: type === 'success' ? NotificationType.Success : type === 'warning' ? NotificationType.Warning : NotificationType.Error 
        });
      } catch (error) {
        // Silently fail if haptics not available
      }
    }
  };

  return {
    light,
    medium,
    heavy,
    selection,
    notification,
    isNative
  };
};
