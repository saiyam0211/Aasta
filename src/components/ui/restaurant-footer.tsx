'use client';

import React from 'react';
import { MapPin, Phone, Clock, Info, AlertTriangle, Shield, FileText } from 'lucide-react';

interface RestaurantFooterProps {
  restaurant: {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    openingHours?: string;
    fssaiLicense?: string;
    outlet?: string;
  };
}

export default function RestaurantFooter({ restaurant }: RestaurantFooterProps) {
  return (
    <div className="">
      {/* Restaurant Details */}
      <div className="px-6 py-8">
        <div className="space-y-6">
          {/* FSSAI License */}
          <div className="flex items-center gap-3 py-2">
            <img 
              src="/images/fssai-seeklogo.png" 
              alt="FSSAI Logo" 
              className="w-auto h-8"
            />
            <div className="flex-1">
              <p className="text-sm mt-1 text-gray-600">
                License No. {restaurant.fssaiLicense || '21225009000721'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer Section */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Disclaimer</span>
          </div>
          
          <div className="space-y-2 text-xs text-gray-600">
            <p>• All prices are set directly by the restaurant.</p>
            <p>• All nutritional information is indicative, values are per serve as shared by the restaurant and may vary depending on the ingredients and portion size.</p>
            <p>• An average active adult requires 2,000 kcal energy per day, however, calorie needs may vary.</p>
            <p>• Dish details might be AI crafted for a better experience</p>
          </div>
        </div>
      </div>

      {/* Report Issue */}
      <div className="px-6 py-4 border-t border-gray-200">
        <button className="flex items-center justify-between w-full text-left hover:bg-gray-50 rounded-lg p-2 -m-2">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-700">Report an issue with the menu</span>
          </div>
          <div className="text-gray-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}
