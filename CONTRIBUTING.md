# Contributing to Avolve DAO

Thank you for your interest in contributing to Avolve DAO! We're building a transformative platform that helps individuals and communities evolve through token-based incentives and gamified experiences.

## 🌟 2025 Vision

Our platform is evolving to support deeper transformation through:
- Real-time social features that inspire personal growth
- Community-driven chat experiences that foster collaboration
- Token rewards that incentivize meaningful engagement
- Accessible and inclusive design (WCAG 2.2 AA compliant)

## 🎯 Focus Areas

### 1. Transformation Features
- Real-time posts with token rewards
- AI-driven prompts for meaningful sharing
- Engagement tracking and milestones
- Progressive unlocking based on participation

### 2. Chat and Community
- Real-time messaging in Regen Circles
- Token-gated access levels
- Community reputation systems
- Collaborative achievement tracking

### 3. Token Integration
- GEN token for ecosystem governance
- SAP token for personal achievements
- SCQ token for community contributions
- Daily token claims and streak bonuses

### 4. Accessibility and UX
- WCAG 2.2 AA compliance
- Dark mode support
- High-contrast themes
- Screen reader optimization

## 🚀 Getting Started

1. Fork the repository
2. Create a feature branch
3. Install dependencies with `pnpm install`
4. Create a `.env.local` file (see below)
5. Start development with `pnpm dev`

### Environment Setup

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI Configuration (for AI prompts)
OPENAI_API_KEY=your_openai_key

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_PROMPTS=true
NEXT_PUBLIC_ENABLE_REAL_TIME_CHAT=true
```

## 📝 Development Guidelines

### Adding New Features

1. **Social Features**
   - Use real-time Supabase subscriptions
   - Implement token rewards for engagement
   - Follow accessibility guidelines
   - Add comprehensive test coverage

2. **Chat Features**
   - Use WebSocket connections for real-time updates
   - Implement message persistence
   - Add moderation capabilities
   - Support rich media content

3. **Token Features**
   - Follow token-gating best practices
   - Implement secure transaction handling
   - Add detailed activity logging
   - Support multiple token types

### Code Style

- Use TypeScript for type safety
- Follow the Prettier configuration
- Use ESLint for code quality
- Write meaningful commit messages

### Testing

- Write unit tests for new features
- Add integration tests for API endpoints
- Include accessibility tests
- Test across different devices and browsers

### Documentation

- Update relevant documentation
- Add JSDoc comments for functions
- Include usage examples
- Document accessibility features

## 🔄 Pull Request Process

1. **Branch Naming**
   - Feature: `feature/description`
   - Fix: `fix/description`
   - Docs: `docs/description`

2. **Commit Messages**
   ```
   feat: add real-time chat for Regen Circles
   fix: resolve token claim delay issue
   docs: update accessibility guidelines
   ```

3. **PR Description**
   - Clearly describe the changes
   - Link related issues
   - Include screenshots/videos
   - List breaking changes

4. **Review Process**
   - Address review comments
   - Update documentation
   - Ensure tests pass
   - Maintain code quality

## 🎨 Design Guidelines

### UI Components
- Use shadcn/ui components
- Follow Tailwind CSS best practices
- Maintain consistent spacing
- Support dark mode

### Accessibility
- Meet WCAG 2.2 AA standards
- Test with screen readers
- Support keyboard navigation
- Provide alternative text

### Journey Themes
- Use semantic color tokens
- Support high contrast
- Maintain consistent gradients
- Follow color ratio guidelines

## 🤝 Community Guidelines

- Be respectful and inclusive
- Help others learn and grow
- Share knowledge openly
- Celebrate achievements

## Ownership & Licensing

All contributions to this project become the exclusive property of the Avolve DAO and are subject to the DAO’s governance, licensing, and usage terms. By contributing, you agree to these terms.

## 📚 Additional Resources

- [Design System Documentation](./docs/sacred-geometry-design-system.md)
- [API Documentation](./docs/api.md)
- [Testing Guide](./docs/testing.md)
- [Security Guidelines](./docs/security.md)

## ❓ Questions?

Join our community channels:
- Discord: [Avolve DAO](https://discord.gg/avolve)
- GitHub Discussions
- Community Forum

For direct support:
- Email: admin@avolve.io
- GitHub Issues
