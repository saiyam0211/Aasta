#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';

interface RouteConfig {
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  priority: 'high' | 'medium' | 'low';
  frequency: number; // minutes
}

// Define routes with priorities and frequencies
const routes: RouteConfig[] = [
  // High priority - frequently accessed routes
  { path: '/', priority: 'high', frequency: 5 },
  { path: '/customer', priority: 'high', frequency: 5 },
  { path: '/customer/dashboard', priority: 'high', frequency: 5 },
  { path: '/restaurant/dashboard', priority: 'high', frequency: 5 },
  { path: '/search', priority: 'high', frequency: 3 },
  { path: '/restaurants', priority: 'high', frequency: 3 },

  // Medium priority - moderately accessed routes
  { path: '/customer/orders', priority: 'medium', frequency: 10 },
  { path: '/restaurant/orders', priority: 'medium', frequency: 10 },
  { path: '/cart', priority: 'medium', frequency: 8 },
  { path: '/checkout', priority: 'medium', frequency: 8 },
  { path: '/orders', priority: 'medium', frequency: 10 },
  { path: '/profile', priority: 'medium', frequency: 15 },

  // Low priority - less frequently accessed routes
  { path: '/customer/discover', priority: 'low', frequency: 20 },
  { path: '/customer/location', priority: 'low', frequency: 20 },
  { path: '/restaurant/menu', priority: 'low', frequency: 20 },
  { path: '/restaurant/financials', priority: 'low', frequency: 30 },
  { path: '/restaurant/operations', priority: 'low', frequency: 30 },
  { path: '/restaurant/onboarding', priority: 'low', frequency: 60 },
  { path: '/delivery-partner', priority: 'low', frequency: 30 },
  { path: '/delivery', priority: 'low', frequency: 30 },
  { path: '/payment', priority: 'low', frequency: 15 },
  { path: '/settings', priority: 'low', frequency: 45 },
  { path: '/operations', priority: 'low', frequency: 60 },
  { path: '/admin', priority: 'low', frequency: 60 },

  // API routes
  { path: '/api/auth/session', method: 'GET', priority: 'high', frequency: 5 },
  { path: '/api/restaurants', method: 'GET', priority: 'high', frequency: 5 },
  { path: '/api/orders', method: 'GET', priority: 'medium', frequency: 10 },
];

interface RouteStatus {
  path: string;
  lastWarmed: number;
  status: number;
  responseTime: number;
  successCount: number;
  failureCount: number;
}

class RouteWarmer {
  private baseUrl: string;
  private statusMap: Map<string, RouteStatus> = new Map();
  private logsDir: string;
  private isRunning: boolean = false;

  constructor() {
    this.baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    this.logsDir = join(process.cwd(), 'logs');

    if (!existsSync(this.logsDir)) {
      mkdirSync(this.logsDir, { recursive: true });
    }

    this.loadStatus();
  }

  private loadStatus() {
    const statusFile = join(this.logsDir, 'route-status.json');
    if (existsSync(statusFile)) {
      try {
        const data = JSON.parse(readFileSync(statusFile, 'utf8'));
        this.statusMap = new Map(Object.entries(data));
      } catch (error) {
        console.log('No existing status file found, starting fresh');
      }
    }
  }

  private saveStatus() {
    const statusFile = join(this.logsDir, 'route-status.json');
    const statusObj = Object.fromEntries(this.statusMap);
    writeFileSync(statusFile, JSON.stringify(statusObj, null, 2));
  }

  private async warmRoute(route: RouteConfig): Promise<void> {
    const now = Date.now();
    const status = this.statusMap.get(route.path);

    // Check if route needs warming
    if (status && now - status.lastWarmed < route.frequency * 60 * 1000) {
      return; // Route is still warm
    }

    try {
      console.log(
        `🔥 Warming route: ${route.path} (${route.priority} priority)`
      );

      const startTime = Date.now();

      // Use curl to warm the route
      const curlCommand = `curl -s -o /dev/null -w "%{http_code}" ${this.baseUrl}${route.path}`;
      const statusCode = execSync(curlCommand, { encoding: 'utf8' }).trim();

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Update status
      const newStatus: RouteStatus = {
        path: route.path,
        lastWarmed: now,
        status: parseInt(statusCode),
        responseTime,
        successCount:
          (status?.successCount || 0) +
          (parseInt(statusCode) >= 200 && parseInt(statusCode) < 400 ? 1 : 0),
        failureCount:
          (status?.failureCount || 0) +
          (parseInt(statusCode) >= 200 && parseInt(statusCode) < 400 ? 0 : 1),
      };

      this.statusMap.set(route.path, newStatus);

      console.log(
        `✅ ${route.path} - Status: ${statusCode}, Time: ${responseTime}ms`
      );
    } catch (error) {
      console.error(`❌ Error warming ${route.path}:`, error);

      const newStatus: RouteStatus = {
        path: route.path,
        lastWarmed: now,
        status: 0,
        responseTime: 0,
        successCount: status?.successCount || 0,
        failureCount: (status?.failureCount || 0) + 1,
      };

      this.statusMap.set(route.path, newStatus);
    }
  }

  public async startWarming() {
    if (this.isRunning) {
      console.log('Route warmer is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting route warmer service...');
    console.log(`📍 Base URL: ${this.baseUrl}`);
    console.log(`📊 Monitoring ${routes.length} routes`);

    // Initial warm-up
    console.log('\n🔥 Performing initial route warm-up...');
    for (const route of routes) {
      await this.warmRoute(route);
      await new Promise((resolve) => setTimeout(resolve, 200)); // Small delay
    }

    // Continuous warming
    console.log('\n🔄 Starting continuous route warming...');
    while (this.isRunning) {
      try {
        for (const route of routes) {
          await this.warmRoute(route);
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // Save status periodically
        this.saveStatus();

        // Wait before next cycle
        await new Promise((resolve) => setTimeout(resolve, 60000)); // 1 minute
      } catch (error) {
        console.error('Error in warming cycle:', error);
        await new Promise((resolve) => setTimeout(resolve, 30000)); // Wait 30 seconds on error
      }
    }
  }

  public stopWarming() {
    this.isRunning = false;
    this.saveStatus();
    console.log('🛑 Route warmer stopped');
  }

  public getStats() {
    const stats = {
      totalRoutes: routes.length,
      warmedRoutes: this.statusMap.size,
      averageResponseTime: 0,
      successRate: 0,
    };

    if (this.statusMap.size > 0) {
      const totalTime = Array.from(this.statusMap.values()).reduce(
        (sum, status) => sum + status.responseTime,
        0
      );
      const totalSuccess = Array.from(this.statusMap.values()).reduce(
        (sum, status) => sum + status.successCount,
        0
      );
      const totalAttempts = Array.from(this.statusMap.values()).reduce(
        (sum, status) => sum + status.successCount + status.failureCount,
        0
      );

      stats.averageResponseTime = totalTime / this.statusMap.size;
      stats.successRate =
        totalAttempts > 0 ? (totalSuccess / totalAttempts) * 100 : 0;
    }

    return stats;
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Run the route warmer
if (require.main === module) {
  const warmer = new RouteWarmer();

  warmer
    .startWarming()
    .then(() => {
      console.log('Route warmer completed');
    })
    .catch((error) => {
      console.error('Route warmer failed:', error);
      process.exit(1);
    });
}

export { RouteWarmer, routes };
