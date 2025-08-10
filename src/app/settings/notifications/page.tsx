"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Clock,
  Save,
  RefreshCw
} from "lucide-react";

interface NotificationPreferences {
  id: string;
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  telegramEnabled: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  deliveryAlerts: boolean;
  systemAnnouncements: boolean;
  frequency: 'REAL_TIME' | 'HOURLY' | 'DAILY' | 'WEEKLY';
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userId] = useState('cmdlep9va0007unmntpim932o'); // This should come from auth context

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/notifications/preferences?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setPreferences(data.data);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async () => {
    if (!preferences) return;

    try {
      setIsSaving(true);
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      const data = await response.json();
      
      if (data.success) {
        setPreferences(data.data);
        // Show success message
        alert('Notification preferences updated successfully!');
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      alert('Failed to update preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      [key]: value
    });
  };

  const handleInputChange = (key: keyof NotificationPreferences, value: string) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      [key]: value
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading preferences...</span>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Failed to load preferences</h2>
          <Button onClick={fetchPreferences}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
          <p className="text-gray-600 mt-1">Manage how you receive notifications</p>
        </div>
        <Button onClick={updatePreferences} disabled={isSaving}>
          <Save className={`w-4 h-4 mr-2 ${isSaving ? 'animate-spin' : ''}`} />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Channels
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <div>
                <Label className="text-base font-medium">Email Notifications</Label>
                <p className="text-sm text-gray-600">Receive notifications via email</p>
              </div>
            </div>
            <Switch
              checked={preferences.emailEnabled}
              onCheckedChange={(checked) => handleToggle('emailEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-green-600" />
              <div>
                <Label className="text-base font-medium">Push Notifications</Label>
                <p className="text-sm text-gray-600">Receive browser push notifications</p>
              </div>
            </div>
            <Switch
              checked={preferences.pushEnabled}
              onCheckedChange={(checked) => handleToggle('pushEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              <div>
                <Label className="text-base font-medium">SMS Notifications</Label>
                <p className="text-sm text-gray-600">Receive text messages</p>
              </div>
            </div>
            <Switch
              checked={preferences.smsEnabled}
              onCheckedChange={(checked) => handleToggle('smsEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              <div>
                <Label className="text-base font-medium">Telegram Notifications</Label>
                <p className="text-sm text-gray-600">Receive notifications via Telegram</p>
              </div>
            </div>
            <Switch
              checked={preferences.telegramEnabled}
              onCheckedChange={(checked) => handleToggle('telegramEnabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Order Updates</Label>
              <p className="text-sm text-gray-600">Status changes for your orders</p>
            </div>
            <Switch
              checked={preferences.orderUpdates}
              onCheckedChange={(checked) => handleToggle('orderUpdates', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Promotions</Label>
              <p className="text-sm text-gray-600">Special offers and discounts</p>
            </div>
            <Switch
              checked={preferences.promotions}
              onCheckedChange={(checked) => handleToggle('promotions', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Delivery Alerts</Label>
              <p className="text-sm text-gray-600">Updates from delivery partners</p>
            </div>
            <Switch
              checked={preferences.deliveryAlerts}
              onCheckedChange={(checked) => handleToggle('deliveryAlerts', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">System Announcements</Label>
              <p className="text-sm text-gray-600">Important system updates</p>
            </div>
            <Switch
              checked={preferences.systemAnnouncements}
              onCheckedChange={(checked) => handleToggle('systemAnnouncements', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Frequency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Notification Frequency
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-base font-medium">Frequency</Label>
            <select
              value={preferences.frequency}
              onChange={(e) => handleInputChange('frequency', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              <option value="REAL_TIME">Real-time</option>
              <option value="HOURLY">Hourly digest</option>
              <option value="DAILY">Daily digest</option>
              <option value="WEEKLY">Weekly digest</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-base font-medium">Quiet Hours Start</Label>
              <Input
                type="time"
                value={preferences.quietHoursStart || ''}
                onChange={(e) => handleInputChange('quietHoursStart', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-base font-medium">Quiet Hours End</Label>
              <Input
                type="time"
                value={preferences.quietHoursEnd || ''}
                onChange={(e) => handleInputChange('quietHoursEnd', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
