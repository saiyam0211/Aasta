"use client";

import { HomeHeader } from "@/components/ui/home-header";
import { useState } from "react";

export default function GlassEffectSearchPreview() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    console.log("Search query:", query);
    setSearchQuery(query);
  };

  const handleLocationClick = () => {
    console.log("Location clicked");
  };

  const handleFilterClick = () => {
    console.log("Filter clicked");
  };

  const handleCartClick = () => {
    console.log("Cart clicked");
  };

  const handleProfileClick = () => {
    console.log("Profile clicked");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header with Glass Effect Search Bar */}
      <HomeHeader
        locationLabel="123 Main Street, Downtown, New York, NY 10001"
        onLocationClick={handleLocationClick}
        onSearch={handleSearch}
        onFilterClick={handleFilterClick}
        onCartClick={handleCartClick}
        onProfileClick={handleProfileClick}
      />
      
      {/* Content Area */}
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Glass Effect Search Bar Preview
          </h2>
          <p className="text-gray-600 mb-6">
            The search bar above now features a liquid glass effect with enhanced backdrop blur, 
            subtle borders, and smooth transitions. The glass effect creates a modern, translucent 
            appearance that adapts to user interactions.
          </p>
          
          {searchQuery && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800">Last Search Query:</h3>
              <p className="text-green-700">"{searchQuery}"</p>
            </div>
          )}
          
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Glass Effect Features:</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Enhanced backdrop blur with saturation
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Subtle white border with transparency
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Inset shadows for depth and dimension
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Smooth transitions on hover and focus
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Consistent glass effect on filter button
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}