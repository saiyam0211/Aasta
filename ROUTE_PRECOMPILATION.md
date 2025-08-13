# Route Pre-compilation Guide

This guide explains how to use the route pre-compilation system to minimize loading delays and improve user experience.

## Overview

The route pre-compilation system consists of two main components:

1. **Pre-compilation Script** (`src/scripts/precompile-routes.ts`) - One-time compilation of all routes
2. **Route Warmer** (`src/scripts/route-warmer.ts`) - Continuous background warming of routes

## Quick Start

### 1. One-time Pre-compilation

```bash
# Pre-compile all routes before building
npm run build:with-precompile

# Or run pre-compilation separately
npm run precompile-routes
```

### 2. Continuous Route Warming

```bash
# Start the route warmer in the background
npm run start-route-warmer

# Start the app with route warmer
npm run start:with-warmer
```

### 3. Production Deployment with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start both app and route warmer
pm2 start ecosystem.config.js --env production

# Monitor processes
pm2 monit

# View logs
pm2 logs

# Stop all processes
pm2 stop all
```

## Configuration

### Route Priorities

Routes are categorized by priority and warming frequency:

- **High Priority**: Frequently accessed routes (every 3-5 minutes)
  - Homepage, dashboards, search, restaurants list
- **Medium Priority**: Moderately accessed routes (every 8-15 minutes)
  - Orders, cart, checkout, profile
- **Low Priority**: Less frequently accessed routes (every 20-60 minutes)
  - Settings, admin, operations, onboarding

### Customizing Routes

Edit `src/scripts/route-warmer.ts` to modify:

- Route paths
- Warming frequencies
- Priority levels
- API endpoints

### Environment Variables

Set these environment variables:

```bash
NEXTAUTH_URL=http://localhost:3000  # Your app URL
NODE_ENV=production                 # Environment
```

## Monitoring

### Logs

Logs are stored in the `logs/` directory:

- `precompile-YYYY-MM-DD.json` - Pre-compilation results
- `route-status.json` - Current route warming status
- `route-warmer-*.log` - Route warmer logs (with PM2)

### Performance Metrics

The system tracks:

- Response times for each route
- Success/failure rates
- Last warmed timestamp
- Average performance metrics

### Health Checks

Monitor route health with:

```bash
# Check route warmer status
pm2 status

# View route warming statistics
pm2 logs night-delivery-route-warmer
```

## Best Practices

### 1. Development

- Use `npm run precompile-routes` before testing
- Monitor logs during development
- Adjust warming frequencies based on usage patterns

### 2. Production

- Deploy with PM2 for process management
- Set up monitoring and alerting
- Configure appropriate memory limits
- Use load balancers for multiple instances

### 3. Performance Optimization

- Prioritize high-traffic routes
- Adjust warming frequencies based on analytics
- Monitor server resources
- Use CDN for static assets

## Troubleshooting

### Common Issues

1. **Routes not warming**
   - Check if the app is running
   - Verify NEXTAUTH_URL is correct
   - Check network connectivity

2. **High memory usage**
   - Reduce warming frequency
   - Limit concurrent requests
   - Increase memory limits

3. **Slow response times**
   - Optimize database queries
   - Use caching strategies
   - Review route complexity

### Debug Mode

Enable debug logging:

```bash
DEBUG=route-warmer:* npm run start-route-warmer
```

### Manual Testing

Test individual routes:

```bash
curl -I http://localhost:3000/customer/dashboard
curl -I http://localhost:3000/restaurant/orders
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Deploy with Route Pre-compilation
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'

      - run: npm ci
      - run: npm run precompile-routes
      - run: npm run build

      # Deploy to your hosting platform
      - run: npm run deploy
```

## Advanced Configuration

### Custom Warming Strategies

Create custom warming strategies based on:

- User behavior analytics
- Time-based patterns
- Geographic distribution
- Device types

### Load Balancing

For multiple server instances:

1. Use sticky sessions
2. Implement shared warming coordination
3. Distribute warming load across instances
4. Use Redis for shared state

### Monitoring Integration

Integrate with monitoring tools:

- Prometheus metrics
- Grafana dashboards
- Alerting systems
- Performance tracking

## Support

For issues or questions:

1. Check the logs in `logs/` directory
2. Review this documentation
3. Monitor system resources
4. Test routes manually
5. Contact the development team
