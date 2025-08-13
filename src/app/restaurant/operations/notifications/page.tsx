'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import OperationsLayout from '@/components/layouts/operations-layout';
import { Bell, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function Notifications() {
  const [userId, setUserId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendNotification = async () => {
    if (!userId.trim() || !title.trim() || !body.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, title, body }),
      });
      const result = await response.json();

      if (result.success) {
        toast.success('Notification sent successfully!');
        // Clear form
        setUserId('');
        setTitle('');
        setBody('');
      } else {
        toast.error(result.error || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Error sending notification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OperationsLayout type="restaurant">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-[#002a01]">
            <Bell className="h-8 w-8" />
            Send Push Notifications
          </h1>
          <p className="mt-2 text-gray-600">
            Send push notifications to customers who have enabled notifications
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Notification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                User ID
              </label>
              <Input
                placeholder="Enter user ID to send notification"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Notification Title
              </label>
              <Input
                placeholder="Enter notification title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Message Body
              </label>
              <Textarea
                placeholder="Enter notification message"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full"
                rows={4}
              />
            </div>

            <Button
              onClick={sendNotification}
              className="w-full bg-[#002a01] hover:bg-[#002a01]/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Notification
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </OperationsLayout>
  );
}
