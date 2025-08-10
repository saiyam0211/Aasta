module.exports = {
  apps: [
    {
      name: 'night-delivery-app',
      script: 'npm',
      args: 'start',
      cwd: './',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Auto-restart on file changes (development)
      watch: false,
      // Memory limit
      max_memory_restart: '1G',
      // Log files
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Restart policy
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      // Health check
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,
    },
    {
      name: 'night-delivery-route-warmer',
      script: 'tsx',
      args: 'src/scripts/route-warmer.ts',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      },
      env_production: {
        NODE_ENV: 'production',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      },
      // Auto-restart
      autorestart: true,
      max_restarts: 5,
      min_uptime: '10s',
      // Log files
      log_file: './logs/route-warmer-combined.log',
      out_file: './logs/route-warmer-out.log',
      error_file: './logs/route-warmer-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Memory limit
      max_memory_restart: '512M',
    },
  ],
  
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/night-delivery.git',
      path: '/var/www/night-delivery',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    },
  },
}; 