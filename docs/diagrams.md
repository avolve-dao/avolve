# Avolve Platform Diagrams

This document contains Mermaid.js diagram code for visualizing key aspects of the Avolve platform. These diagrams can be embedded in documentation or viewed using a Mermaid renderer.

## Table of Contents

1. [Challenge Flow Diagram](#challenge-flow-diagram)
2. [Invitation System Flow](#invitation-system-flow)
3. [Tesla's 3-6-9 Streak Pattern](#teslas-3-6-9-streak-pattern)
4. [Token Hierarchy](#token-hierarchy)
5. [Database Schema Relationships](#database-schema-relationships)

## Challenge Flow Diagram

```mermaid
flowchart TD
    A[User Logs In] --> B{What Day Is It?}
    B -->|Sunday| C1[SPD Challenge]
    B -->|Monday| C2[SHE Challenge]
    B -->|Tuesday| C3[PSP Challenge]
    B -->|Wednesday| C4[SSA Challenge]
    B -->|Thursday| C5[BSP Challenge]
    B -->|Friday| C6[SGB Challenge]
    B -->|Saturday| C7[SMS Challenge]
    
    C1 --> D[Complete Challenge]
    C2 --> D
    C3 --> D
    C4 --> D
    C5 --> D
    C6 --> D
    C7 --> D
    
    D --> E[Claim Daily Token]
    E --> F{First Time?}
    F -->|Yes| G[Start Streak = 1]
    F -->|No| H{Yesterday Completed?}
    H -->|Yes| I[Increment Streak]
    H -->|No| J[Reset Streak = 1]
    
    I --> K{Streak = 3, 6, or 9?}
    K -->|Yes| L[Apply Tesla Bonus]
    K -->|No| M[Standard Reward]
    L --> N[Mint Tokens]
    M --> N
    J --> N
    G --> N
    
    N --> O[Update User Balance]
    O --> P[Update Dashboard]
```

## Invitation System Flow

```mermaid
flowchart TD
    A[Member] --> B[Create Invitation]
    B --> C{Select Tier}
    C -->|Standard| D1[7 days validity]
    C -->|Silver| D2[14 days validity]
    C -->|Gold| D3[30 days validity]
    C -->|Platinum| D4[60 days validity]
    
    D1 --> E[Generate Unique Code]
    D2 --> E
    D3 --> E
    D4 --> E
    
    E --> F[Share Invitation]
    F --> G[New User Receives Code]
    G --> H[Visit Join Page]
    H --> I[Enter Invitation Code]
    I --> J{Valid Code?}
    
    J -->|Yes| K[Create Account]
    J -->|No| L[Error Message]
    L --> H
    
    K --> M[Complete Profile]
    M --> N[Claim Welcome Bonus]
    N --> O{Which Tier?}
    
    O -->|Standard| P1[Basic Bonus]
    O -->|Silver| P2[1.5x Bonus]
    O -->|Gold| P3[2x Bonus]
    O -->|Platinum| P4[3x Bonus]
    
    P1 --> Q[Start Onboarding]
    P2 --> Q
    P3 --> Q
    P4 --> Q
```

## Tesla's 3-6-9 Streak Pattern

```mermaid
graph TD
    A[User Streak] --> B{Streak Length?}
    
    B -->|1-2 days| C[1.0x Multiplier]
    B -->|3-5 days| D[1.3x Multiplier]
    B -->|6-8 days| E[1.6x Multiplier]
    B -->|9-11 days| F[1.9x Multiplier]
    B -->|12-14 days| G[2.3x Multiplier]
    B -->|15-17 days| H[2.6x Multiplier]
    B -->|18-20 days| I[2.9x Multiplier]
    B -->|21+ days| J[3.3x+ Multiplier]
    
    C --> K[Base Reward]
    D --> L[Enhanced Reward]
    E --> M[Superior Reward]
    F --> N[Excellent Reward]
    G --> O[Outstanding Reward]
    H --> P[Exceptional Reward]
    I --> Q[Phenomenal Reward]
    J --> R[Legendary Reward]
    
    style D fill:#a3e635,stroke:#16a34a
    style E fill:#22d3ee,stroke:#0891b2
    style F fill:#f59e0b,stroke:#d97706
    style G fill:#f59e0b,stroke:#d97706
    style H fill:#f59e0b,stroke:#d97706
    style I fill:#f59e0b,stroke:#d97706
    style J fill:#f59e0b,stroke:#d97706
```

## Token Hierarchy

```mermaid
graph TD
    GEN[GEN - Supercivilization] --> SAP[SAP - Superachiever]
    GEN --> SCQ[SCQ - Superachievers]
    
    SAP --> PSP[PSP - Personal Success Puzzle]
    SAP --> BSP[BSP - Business Success Puzzle]
    SAP --> SMS[SMS - Supermind Superpowers]
    
    SCQ --> SPD[SPD - Superpuzzle Developments]
    SCQ --> SHE[SHE - Superhuman Enhancements]
    SCQ --> SSA[SSA - Supersociety Advancements]
    SCQ --> SGB[SGB - Supergenius Breakthroughs]
    
    style GEN fill:#71717a,stroke:#52525b
    style SAP fill:#78716c,stroke:#57534e
    style SCQ fill:#64748b,stroke:#475569
    
    style PSP fill:#gradient-amber-yellow,stroke:#eab308
    style BSP fill:#gradient-teal-cyan,stroke:#0891b2
    style SMS fill:#gradient-violet-fuchsia,stroke:#a21caf
    
    style SPD fill:#gradient-red-blue,stroke:#2563eb
    style SHE fill:#gradient-rose-orange,stroke:#ea580c
    style SSA fill:#gradient-lime-emerald,stroke:#059669
    style SGB fill:#gradient-sky-indigo,stroke:#4f46e5
    
    classDef gradientPSP fill:#fbbf24,stroke:#eab308
    classDef gradientBSP fill:#06b6d4,stroke:#0891b2
    classDef gradientSMS fill:#d946ef,stroke:#a21caf
    
    classDef gradientSPD fill:#ef4444,stroke:#2563eb
    classDef gradientSHE fill:#f43f5e,stroke:#ea580c
    classDef gradientSSA fill:#84cc16,stroke:#059669
    classDef gradientSGB fill:#0ea5e9,stroke:#4f46e5
    
    class PSP gradientPSP
    class BSP gradientBSP
    class SMS gradientSMS
    
    class SPD gradientSPD
    class SHE gradientSHE
    class SSA gradientSSA
    class SGB gradientSGB
```

## Database Schema Relationships

```mermaid
erDiagram
    USERS ||--o{ PROFILES : has
    USERS ||--o{ USER_BALANCES : has
    USERS ||--o{ CHALLENGE_STREAKS : has
    USERS ||--o{ USER_CHALLENGE_COMPLETIONS : completes
    USERS ||--o{ USER_WEEKLY_CHALLENGES : tracks
    USERS ||--o{ INVITATIONS : creates
    
    TOKENS ||--o{ USER_BALANCES : balances
    TOKENS ||--o{ TOKEN_REWARDS : rewards
    TOKENS }|--|| TOKENS : parent_of
    
    TOKEN_REWARDS ||--o{ DAILY_TOKEN_CHALLENGES : rewards
    
    DAILY_TOKEN_CHALLENGES ||--o{ USER_CHALLENGE_COMPLETIONS : completed_by
    WEEKLY_CHALLENGES ||--o{ USER_WEEKLY_CHALLENGES : tracked_by
    
    INVITATION_TIERS ||--o{ INVITATIONS : categorizes
    
    USERS {
        uuid id PK
        string email
        timestamp created_at
    }
    
    PROFILES {
        uuid id PK
        uuid user_id FK
        string username
        string avatar_url
    }
    
    TOKENS {
        uuid id PK
        string symbol
        string name
        uuid parent_id FK
        string gradient_class
        boolean is_tesla_369
    }
    
    USER_BALANCES {
        uuid id PK
        uuid user_id FK
        uuid token_id FK
        numeric balance
    }
    
    CHALLENGE_STREAKS {
        uuid id PK
        uuid user_id FK
        string token_type
        integer current_daily_streak
        integer longest_daily_streak
        date last_daily_completion_date
        integer streak_milestone_reached
    }
    
    DAILY_TOKEN_CHALLENGES {
        uuid id PK
        uuid reward_id FK
        string challenge_name
        string challenge_description
        jsonb completion_criteria
        numeric bonus_amount
        integer day_of_week
    }
    
    WEEKLY_CHALLENGES {
        uuid id PK
        string token_type
        string challenge_name
        numeric reward_amount
        numeric streak_bonus_multiplier
        timestamp start_date
        timestamp end_date
    }
    
    USER_CHALLENGE_COMPLETIONS {
        uuid id PK
        uuid user_id FK
        uuid challenge_id FK
        timestamp completion_date
        boolean bonus_claimed
    }
    
    USER_WEEKLY_CHALLENGES {
        uuid id PK
        uuid user_id FK
        uuid challenge_id FK
        jsonb progress
        boolean is_completed
        boolean reward_claimed
    }
    
    INVITATION_TIERS {
        uuid id PK
        string tier_name
        integer tier_level
        numeric reward_amount
        integer validity_days
        numeric reward_multiplier
    }
    
    INVITATIONS {
        uuid id PK
        string code
        uuid creator_id FK
        uuid tier_id FK
        string status
        uuid claimed_by FK
        timestamp expires_at
    }
```

You can render these diagrams using:
- GitHub (which supports Mermaid natively in markdown)
- [Mermaid Live Editor](https://mermaid.live/)
- VS Code with the Mermaid extension
- Any documentation tool that supports Mermaid syntax
