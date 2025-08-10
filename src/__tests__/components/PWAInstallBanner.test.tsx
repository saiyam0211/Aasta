import { render, screen } from '@testing-library/react';
import { PWAInstallBanner, OfflineIndicator } from '@/components/PWAInstallBanner';

// Mock the PWA hook
jest.mock('@/hooks/usePWA', () => ({
  usePWA: () => ({
    isInstallable: true,
    isOnline: true,
    isInstalled: false,
    installApp: jest.fn(),
    requestNotificationPermission: jest.fn(),
    subscribeToPushNotifications: jest.fn(),
    addToOfflineQueue: jest.fn(),
  }),
}));

describe('PWAInstallBanner', () => {
  it('renders install banner when installable', () => {
    render(<PWAInstallBanner />);
    
    expect(screen.getByText('Install App')).toBeInTheDocument();
    expect(screen.getByText('Install')).toBeInTheDocument();
    expect(screen.getByText('Later')).toBeInTheDocument();
  });
});

describe('OfflineIndicator', () => {
  it('does not render when online', () => {
    const { container } = render(<OfflineIndicator />);
    expect(container.firstChild).toBeNull();
  });
});
