# Profile API Documentation

_Last updated: 2025-04-16_

The Profile API provides endpoints for accessing and updating user profile information, including display name, avatar, preferences, and connected accounts. Use these endpoints to personalize your experience and manage your account settings.

## Endpoints

- **GET /api/profile** – Retrieve the authenticated user’s profile.
- **PATCH /api/profile** – Update profile fields (display name, avatar, preferences, etc).
- **GET /api/profile/connections** – List connected accounts (social, wallet, etc).

## Usage Example

```js
fetch('/api/profile', {
  headers: { Authorization: 'Bearer <your_token>' },
})
  .then(res => res.json())
  .then(data => console.log(data));
```

## FAQ & Troubleshooting

- **Q: Why can’t I update my email or username?**
  - A: Some fields may be managed by your authentication provider. Use the provider’s dashboard or contact support.
- **Q: How do I connect a new account or wallet?**
  - A: Use the `/api/profile/connections` endpoint and follow the returned instructions.

## Feedback & Support

- For help or to request new profile features, open an issue or email dev@avolve.io

---

For more on user profiles, see [User Guide](../guides/user-guide.md).
