import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export const useHaptics = () => {
  const isNative = Capacitor.isNativePlatform();

  const light = async () => {
    try {
      console.log('🔊 Triggering light haptic feedback');
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      console.warn('Haptics light failed:', error);
    }
  };

  const medium = async () => {
    try {
      console.log('🔊 Triggering medium haptic feedback');
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (error) {
      console.warn('Haptics medium failed:', error);
    }
  };

  const heavy = async () => {
    try {
      console.log('🔊 Triggering heavy haptic feedback');
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (error) {
      console.warn('Haptics heavy failed:', error);
    }
  };

  const selection = async () => {
    try {
      console.log('🔊 Triggering selection haptic feedback');
      await Haptics.selectionStart();
    } catch (error) {
      console.warn('Haptics selection failed:', error);
    }
  };

  const notification = async (type: 'success' | 'warning' | 'error' = 'success') => {
    try {
      console.log('🔊 Triggering notification haptic feedback:', type);
      await Haptics.notification({ 
        type: type === 'success' ? NotificationType.Success : type === 'warning' ? NotificationType.Warning : NotificationType.Error 
      });
    } catch (error) {
      console.warn('Haptics notification failed:', error);
    }
  };

  // Test function to verify haptics are working
  const testHaptics = async () => {
    console.log('🔊 Testing haptics...');
    console.log('🔊 Is native platform:', isNative);
    console.log('🔊 Capacitor platform:', Capacitor.getPlatform());
    console.log('🔊 Capacitor isPluginAvailable Haptics:', await Capacitor.isPluginAvailable('Haptics'));
    
    if (isNative) {
      try {
        console.log('🔊 Attempting to trigger haptic feedback...');
        await Haptics.impact({ style: ImpactStyle.Medium });
        console.log('🔊 Haptics test successful!');
        
        // Try different types
        setTimeout(async () => {
          try {
            await Haptics.impact({ style: ImpactStyle.Light });
            console.log('🔊 Light haptic successful!');
          } catch (e) {
            console.error('🔊 Light haptic failed:', e);
          }
        }, 500);
        
        setTimeout(async () => {
          try {
            await Haptics.impact({ style: ImpactStyle.Heavy });
            console.log('🔊 Heavy haptic successful!');
          } catch (e) {
            console.error('🔊 Heavy haptic failed:', e);
          }
        }, 1000);
        
      } catch (error) {
        console.error('🔊 Haptics test failed:', error);
        console.error('🔊 Error details:', JSON.stringify(error));
      }
    } else {
      console.log('🔊 Not on native platform, haptics disabled');
    }
  };

  return {
    light,
    medium,
    heavy,
    selection,
    notification,
    testHaptics,
    isNative
  };
};
