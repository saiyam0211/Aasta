#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

interface RouteConfig {
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Record<string, string>;
}

// Define all your application routes
const routes: RouteConfig[] = [
  // Main pages
  { path: '/' },
  { path: '/customer' },
  { path: '/customer/dashboard' },
  { path: '/customer/orders' },
  { path: '/customer/discover' },
  { path: '/customer/location' },
  
  // Restaurant routes
  { path: '/restaurant/dashboard' },
  { path: '/restaurant/orders' },
  { path: '/restaurant/menu' },
  { path: '/restaurant/financials' },
  { path: '/restaurant/operations' },
  { path: '/restaurant/onboarding' },
  { path: '/restaurant/auth' },
  
  // Delivery routes
  { path: '/delivery-partner' },
  { path: '/delivery' },
  
  // Order and payment routes
  { path: '/orders' },
  { path: '/cart' },
  { path: '/checkout' },
  { path: '/payment' },
  
  // Search and discovery
  { path: '/search' },
  { path: '/restaurants' },
  
  // Auth routes
  { path: '/auth' },
  
  // Admin routes
  { path: '/admin' },
  
  // Profile and settings
  { path: '/profile' },
  { path: '/settings' },
  
  // Operations
  { path: '/operations' },
  
  // API routes (for pre-compilation)
  { path: '/api/auth/session', method: 'GET' },
  { path: '/api/restaurants', method: 'GET' },
  { path: '/api/orders', method: 'GET' },
];

async function precompileRoutes() {
  console.log('🚀 Starting route pre-compilation...');
  
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const results: Array<{ path: string; status: number; time: number }> = [];
  
  // Create logs directory if it doesn't exist
  const logsDir = join(process.cwd(), 'logs');
  if (!existsSync(logsDir)) {
    mkdirSync(logsDir, { recursive: true });
  }
  
  for (const route of routes) {
    try {
      console.log(`📡 Pre-compiling: ${route.path}`);
      
      const startTime = Date.now();
      
      // Use curl to make a request to the route
      const curlCommand = `curl -s -o /dev/null -w "%{http_code}" ${baseUrl}${route.path}`;
      const statusCode = execSync(curlCommand, { encoding: 'utf8' }).trim();
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      results.push({
        path: route.path,
        status: parseInt(statusCode),
        time: responseTime,
      });
      
      console.log(`✅ ${route.path} - Status: ${statusCode}, Time: ${responseTime}ms`);
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Error pre-compiling ${route.path}:`, error);
      results.push({
        path: route.path,
        status: 0,
        time: 0,
      });
    }
  }
  
  // Save results to a log file
  const logFile = join(logsDir, `precompile-${new Date().toISOString().split('T')[0]}.json`);
  writeFileSync(logFile, JSON.stringify(results, null, 2));
  
  // Print summary
  const successful = results.filter(r => r.status >= 200 && r.status < 400).length;
  const failed = results.length - successful;
  const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length;
  
  console.log('\n📊 Pre-compilation Summary:');
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏱️  Average time: ${avgTime.toFixed(2)}ms`);
  console.log(`📝 Log saved to: ${logFile}`);
  
  return results;
}

// Run the pre-compilation
if (require.main === module) {
  precompileRoutes()
    .then(() => {
      console.log('🎉 Route pre-compilation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Pre-compilation failed:', error);
      process.exit(1);
    });
}

export { precompileRoutes, routes }; 