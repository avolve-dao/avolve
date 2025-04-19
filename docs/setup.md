# Setup Instructions

This document provides detailed instructions for setting up the Avolve application for both local development and production deployment.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.x or higher
- **pnpm**: Version 9.x or higher
- **Git**: For version control
- **Supabase Account**: For database and authentication

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/avolve-dao/avolve.io.git
cd avolve
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Supabase

1. Create a new project in the [Supabase Dashboard](https://app.supabase.io/)
2. Once your project is created, go to Project Settings > API to find your:
   - Project URL
   - Project API Key (anon/public)

### 4. Configure Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Initialize Supabase Local Development

If you want to develop with a local Supabase instance:

1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Start the local Supabase services:
   ```bash
   supabase start
   ```

3. Update your `.env.local` file with the local Supabase credentials.

### 6. Run Database Migrations

Apply the database migrations to set up your schema:

```bash
pnpm supabase migration up
```

### 7. Start the Development Server

```bash
pnpm dev
```

Your application should now be running at [http://localhost:3000](http://localhost:3000).

## Production Deployment

### Deploying to Vercel

1. **Connect your GitHub Repository**:
   - Create an account on [Vercel](https://vercel.com)
   - Create a new project and import your GitHub repository
   - Select the "Next.js" framework preset

2. **Configure Environment Variables**:
   Add the following environment variables in the Vercel project settings:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-supabase-anon-key
   NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
   ```

3. **Deploy**:
   - Vercel will automatically build and deploy your application
   - Each push to the `main` branch will trigger a new deployment

### Supabase Configuration for Production

1. **Update Supabase Site URL**:
   - Go to your Supabase project settings
   - Update the Site URL to match your production domain
   - Add your production domain to the list of allowed redirect URLs

2. **Configure Email Templates**:
   - Go to Authentication > Email Templates
   - Customize the email templates for:
     - Confirm Signup
     - Invite User
     - Magic Link
     - Change Email Address
     - Reset Password
     - Reauthentication
   - Use the Inter font and zinc color palette for consistency

3. **Run Migrations in Production**:
   - Set up the GitHub Actions workflow for migrations:
     ```bash
     git push origin main
     ```
   - The workflow in `.github/workflows/supabase-migrations.yml` will automatically run migrations on your production Supabase instance

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | The URL of your Supabase project | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | The anonymous key for your Supabase project | Yes |
| `NEXT_PUBLIC_SITE_URL` | The URL where your application is hosted | Yes |

## Troubleshooting

### Common Issues

1. **Authentication Errors**:
   - Ensure your Supabase URL and anon key are correct
   - Check that your site URL is properly configured in Supabase
   - Verify that redirect URLs are properly set up

2. **Database Migration Errors**:
   - Ensure you have the latest migrations
   - Check for any conflicts in migration files
   - Run `pnpm supabase migration repair` if needed

3. **Build Errors**:
   - Check for any TypeScript errors
   - Ensure all dependencies are installed
   - Verify that your Next.js configuration is correct

### Getting Help

If you encounter any issues not covered here, please:
1. Check the [GitHub Issues](https://github.com/avolve-dao/avolve.io/issues) for similar problems
2. Create a new issue with detailed information about your problem
3. Reach out to the development team for assistance
