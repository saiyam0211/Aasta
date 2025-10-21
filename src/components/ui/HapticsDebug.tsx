'use client';

import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export function HapticsDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const checkHaptics = async () => {
      const info = {
        platform: Capacitor.getPlatform(),
        isNative: Capacitor.isNativePlatform(),
        isPluginAvailable: await Capacitor.isPluginAvailable('Haptics'),
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };
      
      setDebugInfo(info);
      console.log('🔊 Haptics Debug Info:', info);
    };

    checkHaptics();
  }, []);

  const testDirectHaptics = async () => {
    try {
      console.log('🔊 Testing direct haptics call...');
      await Haptics.impact({ style: ImpactStyle.Medium });
      console.log('🔊 Direct haptics call successful!');
    } catch (error) {
      console.error('🔊 Direct haptics call failed:', error);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black text-white p-3 rounded text-xs max-w-xs">
      <h4 className="font-bold mb-2">Haptics Debug</h4>
      <div className="space-y-1">
        <div>Platform: {debugInfo.platform}</div>
        <div>Native: {debugInfo.isNative ? 'Yes' : 'No'}</div>
        <div>Plugin Available: {debugInfo.isPluginAvailable ? 'Yes' : 'No'}</div>
        <div>User Agent: {debugInfo.userAgent?.substring(0, 50)}...</div>
      </div>
      <button
        onClick={testDirectHaptics}
        className="mt-2 bg-red-500 text-white px-2 py-1 rounded text-xs"
      >
        Test Direct
      </button>
    </div>
  );
}
