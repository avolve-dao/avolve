# Experience API Documentation

_Last updated: 2025-04-16_

The Experience API provides endpoints for tracking user progress, achievements, milestones, and streaks across the Avolve platform. Use these endpoints to fetch and update experience data, unlock features, and power gamification.

## Endpoints

- **GET /api/experience** – Retrieve the current experience, streaks, and milestones for the authenticated user.
- **POST /api/experience/progress** – Update user progress (e.g., after completing a challenge).
- **GET /api/experience/leaderboard** – View top users by experience points or streaks.

## Usage Example

```js
fetch('/api/experience', {
  headers: { Authorization: 'Bearer <your_token>' },
})
  .then(res => res.json())
  .then(data => console.log(data));
```

## FAQ & Troubleshooting

- **Q: My streak didn’t update after a challenge.**
  - A: Ensure your challenge submission was successful and wait a few seconds for processing.
- **Q: How do I unlock new features?**
  - A: Feature unlocks are based on experience milestones—see the response for unlock requirements.

## Feedback & Support

- For help or to request new experience features, open an issue or email dev@avolve.io

---

For more on the experience system, see [Experience Phases](../EXPERIENCE-PHASES.md).
