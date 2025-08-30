'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { NotificationNav } from '@/components/ui/NotificationNav';
import { toast } from 'sonner';
import { Send, Clock, Users, Calendar, Bell } from 'lucide-react';

export default function EnhancedNotificationsPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [notificationType, setNotificationType] = useState('INSTANT');
  const [targetType, setTargetType] = useState('ALL');
  const [scheduledFor, setScheduledFor] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pwaUsers, setPwaUsers] = useState<any[]>([]);

  useEffect(() => {
    loadPWAUsers();
  }, []);

  const loadPWAUsers = async () => {
    try {
      const response = await fetch('/api/enhanced-notifications?action=get-pwa-users');
      if (response.ok) {
        const data = await response.json();
        setPwaUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to load PWA users:', error);
    }
  };

  const sendNotification = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Please fill in title and message');
      return;
    }

    if (notificationType === 'SCHEDULED' && !scheduledFor) {
      toast.error('Please select scheduled time');
      return;
    }

    setIsLoading(true);

    try {
      const notification = {
        title,
        body,
        image: imageUrl || undefined,
        data: { type: notificationType, timestamp: new Date().toISOString() },
      };

      const payload: any = {
        type: notificationType === 'SCHEDULED' ? 'SCHEDULE' : 
              targetType === 'ALL' ? 'SEND_TO_ALL' : 'SEND_TO_USER',
        notification,
      };

      if (notificationType === 'SCHEDULED') {
        payload.scheduledFor = scheduledFor;
      }

      const response = await fetch('/api/enhanced-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          notificationType === 'SCHEDULED' 
            ? `Notification scheduled successfully! ID: ${result.scheduledId}`
            : 'Notification sent successfully!'
        );
        
        setTitle('');
        setBody('');
        setImageUrl('');
        setScheduledFor('');
      } else {
        toast.error(result.error || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <NotificationNav />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Enhanced Notifications
        </h1>
        <p className="text-gray-600">
          Send rich notifications with images, schedule them, and target specific users
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Create Notification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="notificationType">Notification Type</Label>
              <Select value={notificationType} onValueChange={setNotificationType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INSTANT">Instant</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Notification title"
              />
            </div>

            <div>
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Notification message"
                rows={3}
              />
            </div>

            <ImageUpload
              onImageUploaded={(url) => setImageUrl(url)}
              onImageRemoved={() => setImageUrl('')}
              currentImageUrl={imageUrl}
            />

            {notificationType === 'SCHEDULED' && (
              <div>
                <Label htmlFor="scheduledFor" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule For
                </Label>
                <Input
                  id="scheduledFor"
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                />
              </div>
            )}

            <div>
              <Label htmlFor="targetType">Target</Label>
              <Select value={targetType} onValueChange={setTargetType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All PWA Users</SelectItem>
                  <SelectItem value="SPECIFIC">Specific Users</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={sendNotification}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  {notificationType === 'SCHEDULED' ? 'Schedule Notification' : 'Send Notification'}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              PWA Users Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {pwaUsers.length}
                  </div>
                  <div className="text-sm text-blue-600">Total Users</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {pwaUsers.filter(u => u.hasActiveSubscription).length}
                  </div>
                  <div className="text-sm text-green-600">Active Subscriptions</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Recent Users</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {pwaUsers.slice(0, 10).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-sm">{user.name}</div>
                        <div className="text-xs text-gray-500">
                          Last active: {new Date(user.lastActive).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
