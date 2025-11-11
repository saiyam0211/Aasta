# Development Guide

This document provides guidelines and best practices for developing the Aasta platform.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Environment](#development-environment)
- [Code Structure](#code-structure)
- [Development Workflow](#development-workflow)
- [Best Practices](#best-practices)
- [Testing](#testing)
- [Debugging](#debugging)
- [Common Tasks](#common-tasks)

---

## Getting Started

### Prerequisites

- Node.js 20+ and npm/pnpm
- PostgreSQL database
- Firebase project
- Google Maps API key
- Razorpay account
- AWS S3 bucket (for image uploads)

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd main
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create `.env.local` file (see README.md for required variables)

4. **Set up database**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed  # Optional: seed with sample data
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

---

## Development Environment

### Environment Variables

Create `.env.local` in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/aasta"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Firebase
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_PRIVATE_KEY="your-firebase-private-key"
FIREBASE_CLIENT_EMAIL="your-firebase-client-email"

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# Razorpay
RAZORPAY_KEY_ID="your-razorpay-key-id"
RAZORPAY_KEY_SECRET="your-razorpay-key-secret"

# AWS S3
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="your-aws-region"
AWS_S3_BUCKET_NAME="your-s3-bucket-name"

# Telegram Bot (optional)
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
ENABLE_TELEGRAM_BOT="true"
```

### Development Scripts

```bash
# Development
npm run dev              # Start dev server
npm run dev:web          # Start web dev server
npm run dev:bot          # Start Telegram bot
npm run dev:both         # Start both web and bot

# Building
npm run build            # Build for production
npm run build:mobile     # Build and sync with Capacitor

# Database
npm run db:migrate       # Run migrations
npm run db:generate      # Generate Prisma client
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio
npm run db:reset         # Reset and reseed database

# Testing
npm test                 # Run Jest tests
npm run test:e2e         # Run Playwright E2E tests
npm run test:coverage    # Generate test coverage

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
```

---

## Code Structure

### Directory Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── admin/          # Admin pages
│   ├── auth/           # Auth pages
│   ├── delivery/       # Delivery partner pages
│   ├── operations/     # Operations pages
│   ├── restaurant/     # Restaurant pages
│   └── [customer]/     # Customer pages
├── components/         # React components
│   ├── ui/            # UI components (shadcn/ui)
│   └── layouts/       # Layout components
├── lib/                # Utilities and services
│   ├── auth.ts        # NextAuth configuration
│   ├── prisma.ts      # Prisma client
│   ├── payment-service.ts
│   └── ...
├── hooks/              # Custom React hooks
├── types/              # TypeScript types
└── middleware.ts      # Next.js middleware

prisma/
├── schema.prisma       # Database schema
└── migrations/         # Database migrations
```

### File Naming Conventions

- **Components**: PascalCase (e.g., `RestaurantCard.tsx`)
- **Utilities**: camelCase (e.g., `orderUtils.ts`)
- **API Routes**: kebab-case (e.g., `create-order/route.ts`)
- **Pages**: kebab-case (e.g., `restaurant-dashboard/page.tsx`)

### Code Organization

1. **Components**: Group by feature/domain
2. **API Routes**: Organize by resource (e.g., `/api/orders/`)
3. **Utilities**: Keep in `lib/` directory
4. **Types**: Define in `types/` directory or co-located with components

---

## Development Workflow

### Branch Strategy

- `main` - Production branch
- `develop` - Development branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches
- `hotfix/*` - Hotfix branches

### Git Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Convention

Use conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test additions/changes
- `chore:` - Build/tooling changes

### Pull Request Process

1. Create PR from feature branch to `develop`
2. Ensure all tests pass
3. Code review required
4. Merge after approval

---

## Best Practices

### TypeScript

1. **Use strict mode**: Always use TypeScript strict mode
2. **Type everything**: Avoid `any` type
3. **Use interfaces**: For object shapes
4. **Use types**: For unions, intersections, etc.

### React

1. **Use functional components**: Prefer function components over class components
2. **Use hooks**: Prefer hooks over HOCs
3. **Component composition**: Compose components rather than inherit
4. **Memoization**: Use `useMemo` and `useCallback` appropriately

### API Routes

1. **Error handling**: Always handle errors properly
2. **Validation**: Validate input data
3. **Authentication**: Check authentication in each route
4. **Authorization**: Check user roles/permissions
5. **Response format**: Use consistent response format

### Database

1. **Use Prisma**: Always use Prisma for database access
2. **Transactions**: Use transactions for multi-step operations
3. **Indexes**: Add indexes for frequently queried fields
4. **Migrations**: Always create migrations for schema changes

### Security

1. **Never commit secrets**: Use environment variables
2. **Validate input**: Always validate user input
3. **Sanitize output**: Sanitize data before displaying
4. **Use HTTPS**: Always use HTTPS in production
5. **Rate limiting**: Implement rate limiting for APIs

### Performance

1. **Code splitting**: Use dynamic imports for large components
2. **Image optimization**: Use Next.js Image component
3. **Caching**: Use appropriate caching strategies
4. **Database queries**: Optimize database queries
5. **Bundle size**: Monitor and optimize bundle size

---

## Testing

### Unit Tests

Use Jest for unit testing:

```bash
npm test
```

### E2E Tests

Use Playwright for E2E testing:

```bash
npm run test:e2e
```

### Test Coverage

Generate test coverage:

```bash
npm run test:coverage
```

### Writing Tests

1. **Test structure**: Use describe/it blocks
2. **Test naming**: Use descriptive test names
3. **Test isolation**: Each test should be independent
4. **Mock external services**: Mock external API calls

---

## Debugging

### Next.js Debugging

1. **Use console.log**: For quick debugging
2. **Use debugger**: Set breakpoints in code
3. **Check browser console**: For client-side errors
4. **Check server logs**: For server-side errors

### Database Debugging

1. **Prisma Studio**: Use `npm run db:studio` to inspect database
2. **Query logging**: Enable Prisma query logging
3. **Check migrations**: Verify migrations are applied

### API Debugging

1. **Check request/response**: Log request and response data
2. **Check authentication**: Verify session is valid
3. **Check authorization**: Verify user has required role
4. **Check database**: Verify data exists in database

---

## Common Tasks

### Adding a New API Route

1. **Create route file**: `src/app/api/resource/route.ts`
2. **Export handler**: Export GET, POST, etc. functions
3. **Add authentication**: Check session
4. **Add validation**: Validate input
5. **Handle errors**: Return appropriate error responses

### Adding a New Page

1. **Create page file**: `src/app/route/page.tsx`
2. **Add layout**: Use appropriate layout component
3. **Add authentication**: Protect route if needed
4. **Add styling**: Use Tailwind CSS

### Adding a New Component

1. **Create component file**: `src/components/ComponentName.tsx`
2. **Add TypeScript types**: Define prop types
3. **Add styling**: Use Tailwind CSS
4. **Export component**: Export default or named export

### Database Schema Changes

1. **Update schema**: Edit `prisma/schema.prisma`
2. **Create migration**: `npm run db:migrate`
3. **Generate client**: `npm run db:generate`
4. **Update code**: Update code to use new schema

### Adding a New Role

1. **Update schema**: Add role to `UserRole` enum
2. **Create migration**: Run migration
3. **Add routes**: Create role-specific routes
4. **Add middleware**: Update middleware if needed
5. **Add API endpoints**: Create role-specific APIs

---

## Code Review Checklist

- [ ] Code follows project conventions
- [ ] TypeScript types are correct
- [ ] Error handling is implemented
- [ ] Authentication/authorization is checked
- [ ] Tests are added/updated
- [ ] Documentation is updated
- [ ] No console.logs in production code
- [ ] No hardcoded values
- [ ] Environment variables are used
- [ ] Database queries are optimized
- [ ] Security best practices are followed

---

## Troubleshooting

### Common Issues

1. **Module not found**: Check import paths
2. **Type errors**: Check TypeScript types
3. **Database errors**: Check Prisma schema and migrations
4. **Build errors**: Check Next.js configuration
5. **Runtime errors**: Check browser/server console

### Getting Help

1. Check documentation
2. Search existing issues
3. Ask in team chat
4. Create new issue if needed

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Capacitor Documentation](https://capacitorjs.com/docs)

---

## Support

For questions or issues:
1. Check documentation
2. Search existing issues
3. Contact the development team

