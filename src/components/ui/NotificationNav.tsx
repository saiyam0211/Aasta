'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, Image, Calendar, Users, Zap } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export function NotificationNav() {
  const router = useRouter();
  const pathname = usePathname();

  const isEnhanced = pathname.includes('enhanced-notifications');

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant={!isEnhanced ? 'default' : 'outline'}
              size="sm"
              onClick={() =>
                router.push('/operations/restaurant/notifications')
              }
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              Basic Notifications
            </Button>

            <Button
              variant={isEnhanced ? 'default' : 'outline'}
              size="sm"
              onClick={() =>
                router.push('/operations/restaurant/enhanced-notifications')
              }
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Enhanced Notifications
            </Button>
          </div>

          {isEnhanced && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Image className="h-4 w-4" />
              <span>Image Upload</span>
              <Calendar className="h-4 w-4" />
              <span>Scheduling</span>
              <Users className="h-4 w-4" />
              <span>User Targeting</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
