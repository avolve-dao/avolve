# Token API Documentation

_Last updated: 2025-04-16_

The Token API provides endpoints for managing, transferring, and tracking platform tokens (GEN, SAP, SCQ, PSP, BSP, SMS, SPD, SHE, SSA, SGB). Use these endpoints to check balances, transfer tokens, and view transaction history.

## Endpoints
- **GET /api/token/balance** – Get the current balance for all tokens for the authenticated user.
- **POST /api/token/transfer** – Transfer tokens to another user.
- **GET /api/token/history** – View transaction history (by token, date, or user).

## Usage Example
```js
fetch('/api/token/balance', {
  headers: { Authorization: 'Bearer <your_token>' }
})
  .then(res => res.json())
  .then(data => console.log(data));
```

## FAQ & Troubleshooting
- **Q: Why is my balance not updating after a transfer?**
  - A: Transfers may take a few seconds to process. Refresh and check again.
- **Q: Can I transfer tokens to any user?**
  - A: Yes, as long as you have sufficient balance and the recipient is registered.
- **Q: How do I view detailed transaction history?**
  - A: Use the `/api/token/history` endpoint with appropriate filters.

## Feedback & Support
- For feature requests or issues, open an issue or email dev@avolve.io

---

For more on the token system, see the [Token System Doc](../TOKEN-SYSTEM.md).
