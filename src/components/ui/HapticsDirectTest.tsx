'use client';

import React, { useState } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export function HapticsDirectTest() {
  const [result, setResult] = useState<string>('');

  const testDirectImport = async () => {
    try {
      setResult('Testing direct import...');
      console.log('🔊 Testing direct Haptics import...');
      
      // Test if we can call the function directly
      await Haptics.impact({ style: ImpactStyle.Medium });
      setResult('✅ Direct import successful!');
      console.log('🔊 Direct import successful!');
    } catch (error) {
      setResult(`❌ Direct import failed: ${error}`);
      console.error('🔊 Direct import failed:', error);
    }
  };

  const testPluginAvailability = async () => {
    try {
      setResult('Testing plugin availability...');
      const isAvailable = await Capacitor.isPluginAvailable('Haptics');
      setResult(`Plugin available: ${isAvailable}`);
      console.log('🔊 Plugin available:', isAvailable);
    } catch (error) {
      setResult(`❌ Plugin check failed: ${error}`);
      console.error('🔊 Plugin check failed:', error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-blue-900 text-white p-3 rounded text-xs max-w-xs">
      <h4 className="font-bold mb-2">Direct Haptics Test</h4>
      <div className="space-y-2">
        <button
          onClick={testDirectImport}
          className="w-full bg-green-500 text-white px-2 py-1 rounded text-xs"
        >
          Test Direct Import
        </button>
        <button
          onClick={testPluginAvailability}
          className="w-full bg-blue-500 text-white px-2 py-1 rounded text-xs"
        >
          Check Plugin
        </button>
        <div className="text-xs bg-gray-800 p-2 rounded">
          {result}
        </div>
      </div>
    </div>
  );
}
