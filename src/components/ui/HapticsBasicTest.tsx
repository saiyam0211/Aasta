'use client';

import React, { useState } from 'react';
import { Haptics } from '@capacitor/haptics';

export function HapticsBasicTest() {
  const [result, setResult] = useState<string>('');

  const testBasicVibrate = async () => {
    try {
      setResult('Testing basic vibrate...');
      console.log('🔊 Testing basic vibrate...');
      
      // Try the most basic vibrate function
      await Haptics.vibrate();
      setResult('✅ Basic vibrate successful!');
      console.log('🔊 Basic vibrate successful!');
    } catch (error) {
      setResult(`❌ Basic vibrate failed: ${error}`);
      console.error('🔊 Basic vibrate failed:', error);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-orange-900 text-white p-3 rounded text-xs max-w-xs">
      <h4 className="font-bold mb-2">Basic Haptics Test</h4>
      <div className="space-y-2">
        <button
          onClick={testBasicVibrate}
          className="w-full bg-orange-500 text-white px-2 py-1 rounded text-xs"
        >
          Test Basic Vibrate
        </button>
        <div className="text-xs bg-gray-800 p-2 rounded">
          {result}
        </div>
      </div>
    </div>
  );
}
