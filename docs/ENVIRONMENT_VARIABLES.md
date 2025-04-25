# Avolve Production Environment Variables

This document outlines all environment variables required for the Avolve platform in production. Ensure all these variables are properly set in your production environment.

## Core Environment Variables

| Variable                        | Description               | Required | Example                                    |
| ------------------------------- | ------------------------- | -------- | ------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL      | Yes      | `https://hevrachacwtqdcktblsd.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key    | Yes      | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`  |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service role key | Yes      | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`  |
| `NEXT_PUBLIC_SITE_URL`          | Production site URL       | Yes      | `https://avolve.io`                        |
| `NODE_ENV`                      | Node environment          | Yes      | `production`                               |

## Authentication & Security

| Variable          | Description                  | Required | Example                     |
| ----------------- | ---------------------------- | -------- | --------------------------- |
| `AUTH_SECRET`     | Secret for NextAuth          | Yes      | `your-auth-secret-here`     |
| `NEXTAUTH_URL`    | NextAuth URL                 | Yes      | `https://avolve.io`         |
| `NEXTAUTH_SECRET` | NextAuth secret              | Yes      | `your-nextauth-secret-here` |
| `JWT_SECRET`      | JWT secret for token signing | Yes      | `your-jwt-secret-here`      |
| `COOKIE_SECRET`   | Cookie encryption secret     | Yes      | `your-cookie-secret-here`   |

## Email & Notifications

| Variable                | Description           | Required | Example              |
| ----------------------- | --------------------- | -------- | -------------------- |
| `EMAIL_SERVER_HOST`     | SMTP server host      | Yes      | `smtp.example.com`   |
| `EMAIL_SERVER_PORT`     | SMTP server port      | Yes      | `587`                |
| `EMAIL_SERVER_USER`     | SMTP server username  | Yes      | `user@example.com`   |
| `EMAIL_SERVER_PASSWORD` | SMTP server password  | Yes      | `your-password-here` |
| `EMAIL_FROM`            | From email address    | Yes      | `noreply@avolve.io`  |
| `SUPPORT_EMAIL`         | Support email address | Yes      | `support@avolve.io`  |

## Analytics & Monitoring

| Variable                   | Description                   | Required | Example                                     |
| -------------------------- | ----------------------------- | -------- | ------------------------------------------- |
| `NEXT_PUBLIC_ANALYTICS_ID` | Analytics tracking ID         | No       | `G-XXXXXXXXXX`                              |
| `NEXT_PUBLIC_POSTHOG_KEY`  | PostHog API key               | No       | `phc_xxxxxxxxxxxxxxxxxxxx`                  |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host                  | No       | `https://app.posthog.com`                   |
| `LOGFLARE_API_KEY`         | Logflare API key              | No       | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`      |
| `LOGFLARE_SOURCE_ID`       | Logflare source ID            | No       | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`      |

## Feature Flags & Experimentation

| Variable                            | Description                   | Required | Example                     |
| ----------------------------------- | ----------------------------- | -------- | --------------------------- |
| `NEXT_PUBLIC_FEATURE_FLAGS_ENV`     | Environment for feature flags | No       | `production`                |
| `NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY` | GrowthBook client key         | No       | `sdk-xxxx`                  |
| `NEXT_PUBLIC_GROWTHBOOK_API_HOST`   | GrowthBook API host           | No       | `https://cdn.growthbook.io` |

## Media & Storage

| Variable                            | Description           | Required | Example                    |
| ----------------------------------- | --------------------- | -------- | -------------------------- |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | No       | `your-cloud-name`          |
| `CLOUDINARY_API_KEY`                | Cloudinary API key    | No       | `123456789012345`          |
| `CLOUDINARY_API_SECRET`             | Cloudinary API secret | No       | `your-api-secret-here`     |
| `NEXT_PUBLIC_UPLOAD_API_URL`        | Upload API URL        | No       | `https://api.upload.io`    |
| `UPLOAD_API_KEY`                    | Upload.io API key     | No       | `your-upload-api-key-here` |

## Mobile App (React Native with Expo)

| Variable                        | Description                | Required       | Example                                    |
| ------------------------------- | -------------------------- | -------------- | ------------------------------------------ |
| `EXPO_PUBLIC_SUPABASE_URL`      | Supabase URL for Expo      | Yes for mobile | `https://hevrachacwtqdcktblsd.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key for Expo | Yes for mobile | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`  |
| `EXPO_PUBLIC_API_URL`           | API URL for Expo           | Yes for mobile | `https://avolve.io/api`                    |
| `EXPO_PUBLIC_SITE_URL`          | Site URL for Expo          | Yes for mobile | `https://avolve.io`                        |

## API Integrations

| Variable                             | Description            | Required | Example                               |
| ------------------------------------ | ---------------------- | -------- | ------------------------------------- |
| `OPENAI_API_KEY`                     | OpenAI API key         | No       | `sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| # Stripe API Key
|#STRIPE_SECRET_KEY=REDACTED
STRIPE_SECRET_KEY=REDACTED
|# Stripe Publishable Key
|#NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=REDACTED
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=REDACTED
|# Stripe Webhook Secret
|#STRIPE_WEBHOOK_SECRET=REDACTED
STRIPE_WEBHOOK_SECRET=REDACTED

## CDN & Performance

| Variable                   | Description                    | Required | Example                 |
| -------------------------- | ------------------------------ | -------- | ----------------------- |
| `NEXT_PUBLIC_CDN_URL`      | CDN URL                        | No       | `https://cdn.avolve.io` |
| `NEXT_PUBLIC_IMAGE_DOMAIN` | Image domain for Next.js Image | No       | `images.avolve.io`      |
| `VERCEL_URL`               | Vercel deployment URL          | No       | `avolve.vercel.app`     |

## Security & Compliance

| Variable               | Description                              | Required | Example                            |
| ---------------------- | ---------------------------------------- | -------- | ---------------------------------- |
| `CSP_REPORT_ONLY`      | Content Security Policy report only mode | No       | `true`                             |
| `CSP_REPORT_URI`       | Content Security Policy report URI       | No       | `https://avolve.io/api/csp-report` |
| `RATE_LIMIT_REQUESTS`  | Rate limit requests per window           | No       | `60`                               |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds        | No       | `60000`                            |

## Development & Testing

| Variable              | Description                 | Required | Example    |
| --------------------- | --------------------------- | -------- | ---------- |
| `SKIP_ENV_VALIDATION` | Skip environment validation | No       | `true`     |
| `ANALYZE_BUNDLE`      | Analyze bundle size         | No       | `true`     |
| `NEXT_DEBUG`          | Enable Next.js debugging    | No       | `true`     |
| `DEBUG`               | Enable debug logging        | No       | `avolve:*` |

## Deployment & Infrastructure

| Variable       | Description             | Required | Example                                                |
| -------------- | ----------------------- | -------- | ------------------------------------------------------ |
| `DATABASE_URL` | Database connection URL | Yes      | `postgresql://postgres:password@localhost:5432/avolve` |
| `REDIS_URL`    | Redis connection URL    | No       | `redis://username:password@localhost:6379`             |
| `PORT`         | Server port             | No       | `3000`                                                 |
| `HOST`         | Server host             | No       | `0.0.0.0`                                              |

## Security Considerations

- Never commit environment variables to version control
- Use different values for different environments (development, staging, production)
- Rotate secrets regularly
- Use strong, randomly generated values for secrets
- Limit access to production environment variables to authorized personnel only
- Use a secure environment variable management system (e.g., Vercel, GitHub Secrets, AWS Parameter Store)
- Audit environment variable access and changes

## Setting Environment Variables in Production

### Vercel

1. Go to your Vercel project
2. Navigate to Settings > Environment Variables
3. Add each environment variable
4. Deploy your application

### Docker

Use a `.env` file or pass environment variables directly to the Docker container:

```bash
docker run -e NEXT_PUBLIC_SUPABASE_URL=https://hevrachacwtqdcktblsd.supabase.co -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here -p 3000:3000 avolve
```

### Other Hosting Providers

Refer to your hosting provider's documentation for instructions on setting environment variables.

## Validating Environment Variables

The application includes validation for required environment variables. If any required variables are missing, the application will log an error and may not function correctly.

To validate environment variables manually, run:

```bash
npm run validate-env
```

This script will check that all required environment variables are set and have the correct format.
