'use client';

import React, { useState } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export function HapticsSimpleTest() {
  const [result, setResult] = useState<string>('');

  const testSimpleHaptics = async () => {
    try {
      setResult('Testing simple haptics...');
      console.log('🔊 Testing simple haptics...');
      
      // Try to call haptics directly without checking plugin availability
      await Haptics.impact({ style: ImpactStyle.Medium });
      setResult('✅ Simple haptics successful!');
      console.log('🔊 Simple haptics successful!');
    } catch (error) {
      setResult(`❌ Simple haptics failed: ${error}`);
      console.error('🔊 Simple haptics failed:', error);
    }
  };

  const testLightHaptics = async () => {
    try {
      setResult('Testing light haptics...');
      await Haptics.impact({ style: ImpactStyle.Light });
      setResult('✅ Light haptics successful!');
    } catch (error) {
      setResult(`❌ Light haptics failed: ${error}`);
      console.error('🔊 Light haptics failed:', error);
    }
  };

  const testHeavyHaptics = async () => {
    try {
      setResult('Testing heavy haptics...');
      await Haptics.impact({ style: ImpactStyle.Heavy });
      setResult('✅ Heavy haptics successful!');
    } catch (error) {
      setResult(`❌ Heavy haptics failed: ${error}`);
      console.error('🔊 Heavy haptics failed:', error);
    }
  };

  return (
    <div className="fixed top-4 left-4 z-50 bg-green-900 text-white p-3 rounded text-xs max-w-xs">
      <h4 className="font-bold mb-2">Simple Haptics Test</h4>
      <div className="space-y-2">
        <button
          onClick={testSimpleHaptics}
          className="w-full bg-blue-500 text-white px-2 py-1 rounded text-xs"
        >
          Test Medium
        </button>
        <button
          onClick={testLightHaptics}
          className="w-full bg-yellow-500 text-white px-2 py-1 rounded text-xs"
        >
          Test Light
        </button>
        <button
          onClick={testHeavyHaptics}
          className="w-full bg-red-500 text-white px-2 py-1 rounded text-xs"
        >
          Test Heavy
        </button>
        <div className="text-xs bg-gray-800 p-2 rounded">
          {result}
        </div>
      </div>
    </div>
  );
}
