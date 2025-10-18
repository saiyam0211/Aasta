'use client';

import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';

interface NavigationState {
  isNavigating: boolean;
  targetPath: string | null;
  startTime: number | null;
}

class NavigationService {
  private static instance: NavigationService;
  private navigationState: NavigationState = {
    isNavigating: false,
    targetPath: null,
    startTime: null
  };
  private listeners: Set<(state: NavigationState) => void> = new Set();

  static getInstance(): NavigationService {
    if (!NavigationService.instance) {
      NavigationService.instance = new NavigationService();
    }
    return NavigationService.instance;
  }

  startNavigation(path: string) {
    this.navigationState = {
      isNavigating: true,
      targetPath: path,
      startTime: Date.now()
    };
    this.notifyListeners();
    console.log(`🚀 Navigation started to: ${path}`);
  }

  completeNavigation() {
    const duration = this.navigationState.startTime 
      ? Date.now() - this.navigationState.startTime 
      : 0;
    
    console.log(`✅ Navigation completed in ${duration}ms`);
    
    this.navigationState = {
      isNavigating: false,
      targetPath: null,
      startTime: null
    };
    this.notifyListeners();
  }

  getNavigationState(): NavigationState {
    return { ...this.navigationState };
  }

  subscribe(listener: (state: NavigationState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.navigationState));
  }
}

export const navigationService = NavigationService.getInstance();

// Hook for using navigation service
export function useNavigationService() {
  const [navigationState, setNavigationState] = useState<NavigationState>(
    navigationService.getNavigationState()
  );

  const startNavigation = useCallback((path: string) => {
    navigationService.startNavigation(path);
  }, []);

  const completeNavigation = useCallback(() => {
    navigationService.completeNavigation();
  }, []);

  const navigateWithFeedback = useCallback((path: string, router: any) => {
    startNavigation(path);
    
    // Add a small delay to show the navigation feedback
    setTimeout(() => {
      router.push(path);
      completeNavigation();
    }, 50);
  }, [startNavigation, completeNavigation]);

  return {
    navigationState,
    startNavigation,
    completeNavigation,
    navigateWithFeedback
  };
}
