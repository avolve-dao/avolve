# Admin & Developer Onboarding: Avolve Tokenomics & Gamification

Welcome, Admins and Developers! This guide provides a comprehensive overview to help you effectively manage, monitor, and extend the Avolve gamification and tokenomics system.

---

## 1. Admin Dashboards & Analytics

- **Engagement Overview:** Real-time tracking of user activity, token flows, and challenge completions.
- **Token Supply & Distribution:** Monitoring of total supply, top users, and suspicious activity.
- **Challenge Management:** Creation, editing, and retirement of challenges and rewards.
- **Analytics Examples:** See [Database API Docs](./database-api.md) for sample queries and ER diagram.

---

## 2. Manual Tools & Corrections

- **Token Manager Walkthrough:** Step-by-step guide for minting, assigning, and correcting tokens.
- **Dispute Resolution:** How to investigate and resolve user disputes over rewards or balances.
- **Audit Logs:** Review of all admin actions and token transactions for enhanced security and compliance.
- **Troubleshooting:** Common issues and solutions for token management and dispute resolution.

---

## 3. Security & Best Practices

- **Row Level Security (RLS):** Ensures restricted access to sensitive data, allowing only authorized users to access or modify.
- **Defensive Programming:** Implementation of error handling and null checks in all backend logic.
- **Documentation:** Maintenance of well-documented and commented migrations, functions, and policies.

---

## 4. Extending the System

- **Adding New Tokens or Challenges:** Update of migrations and codebase to introduce new gamified elements.
- **Policy Updates:** Regular review and update of RLS and admin policies as necessary.
- **Analytics Integration:** Utilization or extension of analytics views for deeper insights.
- **Change Management:** Best practices for onboarding new admins and updating gamification flows.

---

## 5. Running Parameterized Simulations

Avolve's simulation script now supports sophisticated scenario-based testing to help you iterate and improve gamification/tokenomics.

### How to Run a Simulation with a Scenario

1. **Create or use a scenario file** (JSON) in `scripts/scenarios/` (examples provided).
2. **Run the simulation script with the scenario:**

```bash
pnpm ts-node scripts/simulate-gamification.ts --scenario scripts/scenarios/normal-growth.json --output results/normal-growth-summary.json
```

- `--scenario`: Path to your scenario config file
- `--output`: (Optional) Path to write the summary report (JSON)

### Scenario File Example

```json
{
  "name": "Normal Growth",
  "num_users": 100,
  "sim_days": 21,
  "user_types": [
    { "type": "power_user", "percent": 10, "actions_per_day": 10 },
    { "type": "lurker", "percent": 30, "actions_per_day": 1 },
    { "type": "normal", "percent": 60, "actions_per_day": 3 }
  ],
  "invite_rate": 0.2,
  "group_quest_rate": 0.1,
  "special_events": [
    { "day": 14, "event": "double_rewards", "multiplier": 2 }
  ]
}
```

### Interpreting the Output

- The simulation outputs a summary report with:
  - Scenario name, user count, simulation days
  - Token distribution by type
  - Engagement stats (XP events, invites, group quests, badges, onboarding)
  - Timestamp
- Example output (JSON):

```json
{
  "scenario": "Normal Growth",
  "num_users": 100,
  "sim_days": 21,
  "stats": {
    "xp_events": 2100,
    "tokens": { "SPD": 300, ... },
    "invites": 420,
    "onboarded": 100,
    "group_quests": 210,
    "badges": 30
  },
  "timestamp": "2025-04-18T23:32:58.000Z"
}
```

### Using Simulation Learnings

- Review token distribution and engagement metrics for anomalies or improvement opportunities
- Compare scenarios (e.g., normal vs. viral growth) to stress-test tokenomics
- Use findings to adjust reward rates, policies, or onboarding flows

For advanced analysis, import the JSON summary into your analytics tool or spreadsheet.

---

## 6. Onboarding New Admins/Devs

- **Guide Sharing:** Ensure all new admins/devs read this onboarding document.
- **Database & API Documentation Review:** Familiarization with the schema, RPCs, and security policies.
- **Support and Clarification:** Reach out to the core team for support or clarification.
- **In-App Help:** Guidance for using the admin dashboard's built-in help features.

---

For more help, see the [Glossary](./glossary.md) or click the “Help” button in the admin dashboard. Avolve empowers you to create a fair, transparent, and rewarding experience for all users. Thank you for your role in building a thriving ecosystem!
