# 🚀 Avolve Platform

> *"Transform yourself, transform the world."*

Welcome to the Avolve platform repository! This project is designed to help individuals and communities evolve through a comprehensive token-based ecosystem that supports personal and collective transformation, built on sacred geometry principles and Tesla's 3-6-9 patterns.

## ✨ Overview

Avolve is built around three main value pillars:

1. **Superachiever** 🏆 - For the individual journey of transformation
2. **Superachievers** 👥 - For collective journey of transformation
3. **Supercivilization** 🌍 - For the ecosystem journey of transformation

Our platform provides tools, resources, and community support to help users evolve in all aspects of their lives, from personal success to business growth and beyond.

## 🧮 Sacred Geometry & Tesla's 3-6-9 Patterns

Avolve incorporates sacred geometry principles and Tesla's 3-6-9 patterns as fundamental design elements across both visual interfaces and system architecture. This approach creates mathematical harmony throughout the platform.

### Why Sacred Geometry?

Sacred geometry principles provide mathematical harmony and balance to our system, offering several key advantages:

1. **Natural Proportions**: The golden ratio (1.618) and Fibonacci sequence create naturally pleasing relationships between elements, making the system intuitively understandable to users.

2. **Scalable Structure**: These mathematical principles allow for infinite scalability while maintaining proportional relationships, ensuring the system can grow without becoming imbalanced.

3. **Psychological Resonance**: Humans naturally recognize and respond positively to these proportions, creating a subconscious sense of harmony when interacting with the platform.

4. **Universal Patterns**: These mathematical relationships appear throughout nature and across cultures, making them universally relatable regardless of a user's background.

### Why Tesla's 3-6-9 Patterns?

Nikola Tesla famously said, "If you only knew the magnificence of the 3, 6, and 9, then you would have the key to the universe." This pattern provides a complementary framework that enhances our system:

1. **Cyclical Completion**: The 3-6-9 pattern represents creation (3), harmony (6), and completion (9), mirroring the natural cycles of growth and development in our platform.

2. **Digital Root Harmony**: Using vortex mathematics and digital roots creates a system where values maintain their essential properties regardless of scale.

3. **Energy Flow Optimization**: Tesla believed these numbers represented the key to understanding energy flow in the universe. Our system uses this principle to optimize the flow of value through the platform.

4. **Pattern Recognition**: The repeating patterns in the 3-6-9 system make it easier for users to recognize and predict behaviors and relationships.

Learn more in our [Sacred Geometry Design System](./docs/sacred-geometry-design-system.md) documentation.

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
- **Design System**: Sacred geometry principles and Tesla's 3-6-9 patterns

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
│   ├── layouts/          # Layout components
│   └── sacred/           # Sacred geometry components
├── lib/                  # Utility functions and hooks
│   ├── supabase/         # Supabase client and utilities
│   ├── auth/             # Authentication utilities
│   ├── rbac/             # Role-based access control
│   ├── token/            # Token-based access control
│   └── sacred-geometry.ts # Sacred geometry utilities
├── public/               # Static assets
├── styles/               # Global styles
│   └── sacred-geometry.css # Sacred geometry styles
├── supabase/             # Supabase configuration
│   ├── migrations/       # Database migrations
│   └── functions/        # Edge functions
├── types/                # TypeScript type definitions
└── docs/                 # Documentation
    └── sacred-geometry-design-system.md # Sacred geometry documentation
```

## 💎 Key Features

### 🧩 Sacred Geometry Design System

Our platform features a comprehensive design system based on sacred geometry principles and Tesla's 3-6-9 patterns:

- Implements golden ratio (1.618) and Fibonacci sequence for natural proportions
- Uses Tesla's 3-6-9 pattern for cyclical completion and energy flow
- Applies vortex mathematics for digital root calculations
- Creates mathematically harmonious UI components and layouts
- Ensures pixel-perfect sizing and spacing throughout the application

Learn more in our [Sacred Geometry Design System](./docs/sacred-geometry-design-system.md) documentation.

### 🪙 Token-Based Access Control

Our platform features a sophisticated token-based access control system that integrates with traditional RBAC. This system:

- Implements a hierarchical token structure aligned with our value pillars
- Organizes tokens into three levels (3, 6, 9) representing creation, harmony, and completion
- Categorizes tokens into families based on their digital roots
- Calculates token values and exchange rates using sacred geometry principles
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
- Sacred geometry principles for token relationships
- Tesla's 3-6-9 patterns for token categorization
- Efficient query patterns
- Row-level security policies
- Comprehensive indexing strategy

Learn more in our [Database documentation](./docs/database.md).

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- [Sacred Geometry Design System](./docs/sacred-geometry-design-system.md)
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
