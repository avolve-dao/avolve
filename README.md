# 🚀 Avolve Platform

> *"Transform yourself, transform the world."*

Welcome to the Avolve platform repository! This project is designed to help individuals and communities evolve through a comprehensive token-based ecosystem that supports personal and collective transformation.

## ✨ Overview

Avolve is built around three main value pillars:

1. **Superachiever** 🏆 - For the individual journey of transformation
2. **Superachievers** 👥 - For collective journey of transformation
3. **Supercivilization** 🌍 - For the ecosystem journey of transformation

Our platform provides tools, resources, and community support to help users evolve in all aspects of their lives, from personal success to business growth and beyond.

## 🛠️ Tech Stack

Avolve is built with modern technologies to ensure a robust, scalable, and delightful user experience:

- **Framework**: Next.js 15
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **Package Manager**: pnpm
- **Service Layer**: Custom service architecture for business logic

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase CLI
- Git

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/avolve-dao/avolve.git
cd avolve
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. **Start the development server**

```bash
pnpm dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000) to see the application in action.

## 🏗️ Project Structure

```
avolve/
├── app/                  # Next.js app directory
│   ├── (auth)/           # Authentication routes
│   ├── (dashboard)/      # Dashboard routes
│   ├── api/              # API routes
│   └── layout.tsx        # Root layout
├── components/           # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   └── layouts/          # Layout components
├── lib/                  # Utility functions and hooks
│   ├── supabase/         # Supabase client and utilities
│   ├── auth/             # Authentication utilities
│   ├── rbac/             # Role-based access control
│   └── token/            # Token-based access control
├── public/               # Static assets
├── styles/               # Global styles
├── supabase/             # Supabase configuration
│   ├── migrations/       # Database migrations
│   └── functions/        # Edge functions
├── types/                # TypeScript type definitions
└── docs/                 # Documentation
```

## 💎 Key Features

### 🪙 Token-Based Access Control

Our platform features a sophisticated token-based access control system that integrates with traditional RBAC. This system:

- Implements a hierarchical token structure aligned with our value pillars
- Provides granular access control based on token ownership
- Enables token transfers, rewards, and transactions
- Supports gamification and progressive unlocking of features

Learn more in our [Token-Based Access documentation](./docs/token-based-access.md).

### 🔒 Security

Avolve prioritizes security at every level:

- Comprehensive authentication flows
- Role-based access control
- Row-level security in the database
- Secure API endpoints
- Regular security audits

Learn more in our [Security documentation](./docs/security.md).

### 📝 Audit Logging

All important actions in the system are logged for accountability and transparency:

- Comprehensive audit trails
- User action tracking
- Token transaction history
- Security event logging

Learn more in our [Audit Logging documentation](./docs/audit-logging.md).

### 🗄️ Database Design

Our database is designed for flexibility, performance, and security:

- Normalized schema design
- Efficient query patterns
- Row-level security policies
- Comprehensive indexing strategy

Learn more in our [Database documentation](./docs/database.md).

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- [Security](./docs/security.md)
- [Audit Logging](./docs/audit-logging.md)
- [Database](./docs/database.md)
- [Token-Based Access](./docs/token-based-access.md)
- [API Reference](./docs/api.md)
- [Authentication](./docs/authentication.md)
- [Best Practices](./docs/best-practices.md)
- [Token System](./docs/token-based-access.md)
- [Notification System](./docs/notification-system.md)
- [Audit Logging](./docs/audit-logging.md)
- [Service Layer](./docs/service-layer.md)

## 🧪 Testing

Run the test suite with:

```bash
pnpm test
```

For end-to-end tests:

```bash
pnpm run test:e2e
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vercel](https://vercel.com/)

---

<p align="center">
  Built with ❤️ by the Avolve team
</p>
