'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { NotificationNav } from '@/components/ui/NotificationNav';
import OperationsLayout from '@/components/layouts/operations-layout';
import { Bell, Send, Users, Smartphone, Monitor } from 'lucide-react';
import { toast } from 'sonner';

export default function Notifications() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEnhancedLink, setShowEnhancedLink] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    pwaClients: 0,
    regularClients: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch current stats
  const fetchStats = async () => {
    try {
      // Set a simple operations session for testing
      if (!localStorage.getItem('operations-session')) {
        localStorage.setItem(
          'operations-session',
          JSON.stringify({
            email: 'operations@aasta.food',
            timestamp: Date.now(),
          })
        );
      }

      const operationsSession = localStorage.getItem('operations-session');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (operationsSession) {
        headers['x-operations-auth'] = operationsSession;
      }

      console.log('📊 Fetching stats with headers:', headers);
      console.log('📊 API URL:', '/api/notification-stats');

      const response = await fetch('/api/notification-stats', {
        method: 'GET',
        headers,
      });

      console.log('📊 Stats response status:', response.status);
      console.log(
        '📊 Stats response headers:',
        Object.fromEntries(response.headers.entries())
      );

      if (response.ok) {
        const responseText = await response.text();
        console.log('📊 Raw response:', responseText);

        if (!responseText.trim()) {
          console.error('📊 Empty response received');
          return;
        }

        try {
          const result = JSON.parse(responseText);
          setStats(result.stats);
          console.log('📊 Updated stats:', result.stats);
        } catch (parseError) {
          console.error('JSON Parse Error in stats:', parseError);
          console.error('Response text:', responseText);
          console.error(
            'Response appears to be HTML - API route may not exist or authentication failed'
          );
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch stats:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });

        if (response.status === 404) {
          console.error(
            '❌ API route /api/notification-stats not found - check if route file exists'
          );
        } else if (response.status === 401) {
          console.error('❌ Authentication failed - check operations session');
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Load stats on component mount and refresh every 10 seconds
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const sendNotificationToAll = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Please fill in title and message');
      return;
    }

    try {
      setIsLoading(true);

      // Set a simple operations session for testing
      if (!localStorage.getItem('operations-session')) {
        localStorage.setItem(
          'operations-session',
          JSON.stringify({
            email: 'operations@aasta.food',
            timestamp: Date.now(),
          })
        );
      }

      // Get operations session from localStorage
      const operationsSession = localStorage.getItem('operations-session');

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add operations auth header if available
      if (operationsSession) {
        headers['x-operations-auth'] = operationsSession;
      }

      console.log('📤 Sending notification with headers:', headers);
      console.log('📤 Notification payload:', { broadcast: true, title, body });

      const response = await fetch('/api/send-notification', {
        method: 'PUT', // Use PUT for bulk send
        headers,
        body: JSON.stringify({
          broadcast: true, // Flag to send to all customers
          title,
          body,
        }),
      });

      console.log('📤 Send notification response status:', response.status);
      console.log(
        '📤 Send notification response headers:',
        Object.fromEntries(response.headers.entries())
      );

      const responseText = await response.text();
      console.log('📤 Send notification raw response:', responseText);

      if (!responseText.trim()) {
        console.error('📤 Empty response received from send notification');
        toast.error('Failed to send notification - empty response');
        return;
      }

      try {
        const result = JSON.parse(responseText);

        if (response.ok) {
          toast.success(
            `Notification sent successfully! Sent to ${result.sent || 0} users, ${result.failed || 0} failed.`
          );
          setTitle('');
          setBody('');
          fetchStats(); // Refresh stats
        } else {
          console.error('❌ Send notification failed:', result);
          toast.error(result.error || 'Failed to send notification');
        }
      } catch (parseError) {
        console.error('JSON Parse Error in send notification:', parseError);
        console.error('Response text:', responseText);
        console.error(
          'Response appears to be HTML - API route may not exist or authentication failed'
        );

        if (response.status === 404) {
          toast.error('API route not found - check server configuration');
        } else if (response.status === 401) {
          toast.error('Authentication failed - please check your session');
        } else {
          toast.error('Failed to send notification - server error');
        }
      }
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OperationsLayout type="restaurant">
      <div className="mx-auto max-w-2xl">
        <NotificationNav />
        
        <div className="mb-8">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-[#002a01]">
            <Bell className="h-8 w-8" />
            Send Push Notifications
          </h1>
          <p className="mt-2 text-gray-600">
            Send push notifications to customers who have enabled notifications
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Clients</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? '...' : stats.totalClients}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2">
                  <Smartphone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">PWA Clients</p>
                  <p className="text-2xl font-bold text-green-600">
                    {statsLoading ? '...' : stats.pwaClients}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gray-100 p-2">
                  <Monitor className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Regular Clients</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {statsLoading ? '...' : stats.regularClients}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Notification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-blue-800">
                <Bell className="h-4 w-4" />
                <span className="font-medium">Broadcast to All Customers</span>
              </div>
              <p className="text-sm text-blue-700">
                This notification will be sent to all customers who have enabled
                push notifications.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Notification Title
              </label>
              <Input
                placeholder="Enter notification title (e.g., Special Offer, New Menu Items)"
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
                placeholder="Enter your message (e.g., Get 20% off on all orders tonight! Order now and enjoy delicious food.)"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full"
                rows={4}
              />
            </div>

            <Button
              onClick={sendNotificationToAll}
              className="w-full bg-[#002a01] hover:bg-[#002a01]/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  Sending to All Customers...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send to All Customers
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </OperationsLayout>
  );
}
