# 🚀 Avolve Platform

> *"Transform yourself, transform the world."*

Welcome to the Avolve platform repository! This project is designed to help individuals and communities evolve through a comprehensive token-based ecosystem that supports personal and collective transformation, built on sacred geometry principles and Tesla's 3-6-9 patterns.

## ✨ Overview

Avolve is built around three main value pillars:

1. **Superachiever** 🏆 - For the individual journey of transformation (SAP token)
2. **Superachievers** 👥 - For collective journey of transformation (SCQ token)
3. **Supercivilization** 🌍 - For the ecosystem journey of transformation (GEN token)

Our platform provides tools, resources, and community support to help users evolve in all aspects of their lives, from personal success to business growth and beyond.

## 🌟 2025 Transformation Features

Avolve's platform empowers personal and collective transformation through three key journeys:

### 🏆 Superachiever Journey (`/superachiever`)
Transform your personal journey through:
- Real-time posts with token rewards (1-5 GEN per post)
- AI-driven prompts for meaningful sharing
- Engagement tracking with milestone rewards (10 SAP at 50% engagement)
- Progressive unlocking based on participation

### 👥 Superachievers Journey (`/superachievers`)
Amplify collective transformation through:
- Real-time chat in Regen Circles
- Group achievements with token rewards (10 GEN for collective wins)
- Community reputation system
- Collaborative goal tracking

### 🌍 Supercivilization Journey (`/supercivilization`)
Contribute to ecosystem transformation through:
- Impact metrics and visualizations
- Token-based governance participation
- Regenerative economy dashboard
- Global transformation tracking

Each journey features:
- WCAG 2.2 AA compliant design
- Dark mode with journey-themed gradients
- Real-time engagement tracking
- Token-gated progressive features
- AI-enhanced interaction prompts

### 🪙 Token System

GEN is the primary token of the Avolve ecosystem, representing the Supercivilization pillar. When users contribute financially, their fiat is allocated as follows:
- 10% to GEN (Supercivilization)
- 40% to SAP (Superachiever)
- 50% to SCQ (Superachievers)

#### Daily Token Claims

The platform follows a weekly schedule for token claims, with each day dedicated to a specific token:

- **Sunday**: SPD (Superpuzzle Developments) - Red-Green-Blue gradient
- **Monday**: SHE (Superhuman Enhancements) - Rose-Red-Orange gradient
- **Tuesday**: PSP (Personal Success Puzzle) - Amber-Yellow gradient
- **Wednesday**: SSA (Supersociety Advancements) - Lime-Green-Emerald gradient
- **Thursday**: BSP (Business Success Puzzle) - Teal-Cyan gradient
- **Friday**: SGB (Supergenius Breakthroughs) - Sky-Blue-Indigo gradient
- **Saturday**: SMS (Supermind Superpowers) - Violet-Purple-Fuchsia-Pink gradient

#### Metrics-Driven Gamification

The platform uses key metrics to drive engagement and measure success:
- **DAU/MAU Ratio**: Daily Active Users / Monthly Active Users (target: >0.3)
- **Retention**: Percentage of users returning after 1, 7, and 30 days
- **ARPU**: Average Revenue Per User
- **NPS**: Net Promoter Score
- **Engagement**: Time spent, actions taken, and content consumed

### 🔓 Feature Unlocking Process

Features are progressively unlocked based on user participation and metrics improvements:

- **Teams**: Unlocked after completing 10 challenges
- **Governance**: Unlocked after accumulating 100 GEN tokens
- **Marketplace**: Unlocked after completing 20 challenges or achieving DAU/MAU > 0.3
- **Token Utility**: Unlocked after completing 5 challenges and claiming 3 different day tokens

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
- Organizes tokens into three main categories: GEN (Supercivilization), SAP (Superachiever), and SCQ (Superachievers)
- Enables daily token claims based on the day of the week
- Provides granular access control based on token ownership
- Enables token transfers, rewards, and transactions
- Supports gamification and progressive unlocking of features based on metrics improvements

Learn more in our [Token System documentation](./docs/token-system.md) and [Regenerative Gamification documentation](./docs/regenerative-gamification.md).

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
- [Token System](./docs/token-system.md)
- [API Reference](./docs/api.md)
- [Authentication](./docs/authentication.md)
- [Best Practices](./docs/best-practices.md)
- [Regenerative Gamification](./docs/regenerative-gamification.md)
- [Notification System](./docs/notification-system.md)
- [Service Layer](./docs/service-layer.md)
- [Values](./docs/values.md)
- [User Guide](./docs/user-guide.md)
- [Developer Guide](./docs/developer-guide.md)

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

This project is proprietary software owned by Avolve DAO. All rights reserved.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vercel](https://vercel.com/)

## 📞 Support

For support or inquiries, contact admin@avolve.io.

---
