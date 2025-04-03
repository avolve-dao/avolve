# Avolve

A modern web application built with Next.js 15, React 19, Tailwind CSS v4, and shadcn/ui.

## Tech Stack

- **Framework**: Next.js 15
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **Database**: Supabase
- **Deployment**: Vercel
- **Package Manager**: pnpm

## Getting Started

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
   ```

4. Run the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment

This project is configured for deployment on Vercel. Connect your GitHub repository to Vercel for automatic deployments.

## Project Structure

- `app/`: Next.js app router pages and layouts
- `components/`: UI components
- `contexts/`: React context providers
- `hooks/`: Custom React hooks
- `lib/`: Utility functions and configurations
- `public/`: Static assets
- `styles/`: Global styles

## License

[MIT](LICENSE)
