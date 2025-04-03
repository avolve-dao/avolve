# Avolve

A modern web application built with Next.js 15, React 19, Tailwind CSS v4, and shadcn/ui components. Avolve provides a comprehensive platform for users to connect, collaborate, and achieve their goals.

## Tech Stack

- **Framework**: Next.js 15
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **Package Manager**: pnpm

## Documentation

- [Conceptual Framework](docs/conceptual-framework.md) - Core values and structure of the Avolve platform
- [Avolve Theme System](docs/avolve-theme.md) - Color system based on the conceptual framework
- [Setup Instructions](docs/setup.md) - Detailed guide for setting up the project locally and in production
- [Architecture Overview](docs/architecture.md) - Overview of the application architecture and design decisions
- [API Documentation](docs/api.md) - Documentation for all API endpoints
- [Authentication](docs/authentication.md) - Details on authentication flows and email templates
- [Database Schema](docs/database.md) - Information about the database schema and relationships

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/avolve-dao/avolve.git
   cd avolve
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. Run the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `app/`: Next.js app router pages and layouts
  - `(superachiever)/`: Route group for superachiever-related pages
  - `(superachievers)/`: Route group for superachievers-related pages
  - `(supercivilization)/`: Route group for supercivilization-related pages
  - `api/`: API routes for server-side functionality
  - `auth/`: Authentication-related pages
  - `dashboard/`: Dashboard and user account pages
- `components/`: Reusable UI components
  - `ui/`: shadcn/ui components
  - `activity/`: Activity-related components
  - `chat/`: Chat and messaging components
  - `grok/`: Grok integration components
  - `profile/`: User profile components
- `contexts/`: React context providers for state management
- `hooks/`: Custom React hooks
- `lib/`: Utility functions and configurations
  - `supabase/`: Supabase client configurations
- `public/`: Static assets
- `styles/`: Global styles
- `supabase/`: Supabase configuration and migrations
  - `migrations/`: Database migration files

## Features

- **Authentication**: Email/password authentication with email verification
- **User Profiles**: Customizable user profiles
- **Dashboard**: Personalized dashboard for users
- **Messaging**: Real-time messaging between users
- **Grok Integration**: AI-powered assistance using Grok

## Contributing

Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

[MIT](LICENSE)
