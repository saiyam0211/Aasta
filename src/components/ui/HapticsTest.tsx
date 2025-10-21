'use client';

import React from 'react';
import { useHaptics } from '@/hooks/useHaptics';
import { Capacitor } from '@capacitor/core';

export function HapticsTest() {
  const { light, medium, heavy, selection, notification, testHaptics, isNative } = useHaptics();

  return (
    <div className="fixed top-20 right-4 z-50 bg-white p-4 rounded-lg shadow-lg border">
      <h3 className="text-sm font-bold mb-2">Haptics Test</h3>
      <div className="text-xs text-gray-600 mb-2">
        Platform: {Capacitor.getPlatform()}
        <br />
        Native: {isNative ? 'Yes' : 'No'}
      </div>
      
      <div className="space-y-2">
        <button
          onClick={testHaptics}
          className="w-full bg-blue-500 text-white px-2 py-1 rounded text-xs"
        >
          Test All
        </button>
        
        <button
          onClick={light}
          className="w-full bg-green-500 text-white px-2 py-1 rounded text-xs"
        >
          Light
        </button>
        
        <button
          onClick={medium}
          className="w-full bg-yellow-500 text-white px-2 py-1 rounded text-xs"
        >
          Medium
        </button>
        
        <button
          onClick={heavy}
          className="w-full bg-red-500 text-white px-2 py-1 rounded text-xs"
        >
          Heavy
        </button>
        
        <button
          onClick={selection}
          className="w-full bg-purple-500 text-white px-2 py-1 rounded text-xs"
        >
          Selection
        </button>
        
        <button
          onClick={() => notification('success')}
          className="w-full bg-green-600 text-white px-2 py-1 rounded text-xs"
        >
          Success
        </button>
        
        <button
          onClick={() => notification('warning')}
          className="w-full bg-orange-500 text-white px-2 py-1 rounded text-xs"
        >
          Warning
        </button>
        
        <button
          onClick={() => notification('error')}
          className="w-full bg-red-600 text-white px-2 py-1 rounded text-xs"
        >
          Error
        </button>
      </div>
    </div>
  );
}
