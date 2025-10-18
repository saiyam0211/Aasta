'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Send, Users, Clock, BarChart3, Bell, Image, Link, Calendar } from 'lucide-react';

interface NotificationStats {
  totalSent: number;
  totalScheduled: number;
  usersWithTokens: number;
  recentNotifications: Array<{
    id: string;
    title: string;
    body: string;
    sentAt: string;
    user: {
      name: string;
      email: string;
    };
  }>;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function SendNotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  
  // Notification form state
  const [notification, setNotification] = useState({
    type: 'custom',
    title: '',
    body: '',
    imageUrl: '',
    targetType: 'all',
    targetUsers: [] as string[],
    data: '',
    actions: '',
    scheduleTime: ''
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    
    loadStats();
    loadUsers();
  }, [session, status, router]);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/notifications/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleSendNotification = async () => {
    if (!notification.title || !notification.body) {
      toast.error('Title and body are required');
      return;
    }

    setSending(true);
    try {
      const payload = {
        type: notification.type,
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl || undefined,
        targetUsers: notification.targetType === 'specific' ? notification.targetUsers : undefined,
        targetType: notification.targetType,
        data: notification.data ? JSON.parse(notification.data) : undefined,
        actions: notification.actions ? JSON.parse(notification.actions) : undefined,
        scheduleTime: notification.scheduleTime || undefined
      };

      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Notification sent successfully!');
        setNotification({
          type: 'custom',
          title: '',
          body: '',
          imageUrl: '',
          targetType: 'all',
          targetUsers: [],
          data: '',
          actions: '',
          scheduleTime: ''
        });
        loadStats();
      } else {
        toast.error(result.error || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const handleUserToggle = (userId: string) => {
    setNotification(prev => ({
      ...prev,
      targetUsers: prev.targetUsers.includes(userId)
        ? prev.targetUsers.filter(id => id !== userId)
        : [...prev.targetUsers, userId]
    }));
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bell className="h-8 w-8 text-green-500" />
            Push Notifications
          </h1>
          <p className="text-gray-600 mt-2">Send notifications to your users</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Send className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Sent</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSent}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Scheduled</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalScheduled}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Users with Tokens</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.usersWithTokens}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">98.5%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Send Notification Form */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Send Notification</h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Notification Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Type
                </label>
                <select
                  value={notification.type}
                  onChange={(e) => setNotification(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="custom">Custom Notification</option>
                  <option value="order_update">Order Update</option>
                  <option value="marketing">Marketing</option>
                  <option value="promotion">Promotion</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={notification.title}
                  onChange={(e) => setNotification(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter notification title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  value={notification.body}
                  onChange={(e) => setNotification(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Enter notification message"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Image className="inline h-4 w-4 mr-1" />
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={notification.imageUrl}
                  onChange={(e) => setNotification(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Target Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="targetType"
                      value="all"
                      checked={notification.targetType === 'all'}
                      onChange={(e) => setNotification(prev => ({ ...prev, targetType: e.target.value }))}
                      className="mr-2"
                    />
                    All Users
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="targetType"
                      value="specific"
                      checked={notification.targetType === 'specific'}
                      onChange={(e) => setNotification(prev => ({ ...prev, targetType: e.target.value }))}
                      className="mr-2"
                    />
                    Specific Users
                  </label>
                </div>
              </div>

              {/* Specific Users Selection */}
              {notification.targetType === 'specific' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Users
                  </label>
                  <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                    {users.map((user) => (
                      <label key={user.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={notification.targetUsers.includes(user.id)}
                          onChange={() => handleUserToggle(user.id)}
                          className="mr-2"
                        />
                        <span className="text-sm">{user.name} ({user.email})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Schedule Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Schedule Time (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={notification.scheduleTime}
                  onChange={(e) => setNotification(prev => ({ ...prev, scheduleTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Actions (JSON) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action Buttons (JSON)
                </label>
                <textarea
                  value={notification.actions}
                  onChange={(e) => setNotification(prev => ({ ...prev, actions: e.target.value }))}
                  placeholder='[{"id": "view_order", "title": "View Order"}]'
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
                />
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendNotification}
                disabled={sending || !notification.title || !notification.body}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {notification.scheduleTime ? 'Schedule Notification' : 'Send Notification'}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Notifications</h2>
            </div>
            
            <div className="p-6">
              {stats?.recentNotifications?.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentNotifications.map((notification) => (
                    <div key={notification.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{notification.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{notification.body}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Sent to {notification.user.name} • {new Date(notification.sentAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No notifications sent yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
