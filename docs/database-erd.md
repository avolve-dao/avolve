# Avolve Database Entity-Relationship Diagram

This document provides a visual representation of the Avolve platform's database schema, focusing on the token-based access system and its relationship to the platform's three main pillars.

## Token System ERD

```mermaid
erDiagram
    TOKENS ||--o{ USER_TOKENS : "owned by"
    TOKENS ||--o{ TOKEN_TRANSACTIONS : "involved in"
    TOKENS ||--o{ TOKEN_STAKING : "staked"
    TOKENS ||--o{ STAKING_REWARDS : "rewards"
    TOKENS ||--o{ TOKEN_REWARDS : "defines rewards"
    TOKENS ||--o{ TOKENS : "parent of"
    PILLARS ||--o{ SECTIONS : "contains"
    SECTIONS ||--o{ COMPONENTS : "contains"
    PILLARS }o--|| TOKENS : "associated with"
    SECTIONS }o--|| TOKENS : "associated with"
    USERS ||--o{ USER_TOKENS : "owns"
    USERS ||--o{ TOKEN_TRANSACTIONS : "participates in"
    USERS ||--o{ TOKEN_STAKING : "stakes"
    USERS ||--o{ STAKING_REWARDS : "earns"
    USERS ||--o{ USER_JOURNEYS : "progresses through"
    USERS ||--o{ USER_SECTION_PROGRESS : "completes"
    USERS ||--o{ USER_COMPONENT_PROGRESS : "interacts with"
    PILLARS ||--o{ USER_JOURNEYS : "tracked in"
    SECTIONS ||--o{ USER_SECTION_PROGRESS : "tracked in"
    COMPONENTS ||--o{ USER_COMPONENT_PROGRESS : "tracked in"

    TOKENS {
        uuid id PK
        text symbol
        text name
        text description
        text icon_url
        text gradient_class
        numeric total_supply
        boolean is_primary
        text blockchain_contract
        text chain_id
        timestamptz created_at
        timestamptz updated_at
        boolean is_active
        boolean is_transferable
        numeric transfer_fee
        uuid parent_token_id FK
    }

    USER_TOKENS {
        uuid id PK
        uuid user_id FK
        uuid token_id FK
        numeric balance
        numeric staked_balance
        numeric pending_release
        timestamptz created_at
        timestamptz updated_at
        timestamptz last_updated
    }

    TOKEN_TRANSACTIONS {
        uuid id PK
        uuid token_id FK
        uuid from_user_id FK
        uuid to_user_id FK
        numeric amount
        text transaction_type
        text reason
        text tx_hash
        timestamptz created_at
    }

    TOKEN_STAKING {
        uuid id PK
        uuid user_id FK
        uuid token_id FK
        numeric amount
        timestamptz staked_at
        timestamptz unstaked_at
        boolean is_active
        integer lock_period_days
        timestamptz unlock_at
        timestamptz created_at
        timestamptz updated_at
    }

    STAKING_REWARDS {
        uuid id PK
        uuid staking_id FK
        uuid user_id FK
        uuid token_id FK
        numeric amount
        boolean is_claimed
        timestamptz claimed_at
        timestamptz created_at
        timestamptz updated_at
    }

    TOKEN_REWARDS {
        uuid id PK
        uuid token_id FK
        text activity_type
        numeric base_amount
        numeric multiplier
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    PILLARS {
        uuid id PK
        text slug
        text title
        text subtitle
        text description
        text icon
        text gradient_class
        integer display_order
        timestamptz created_at
        timestamptz updated_at
        text token_symbol
        text chain_id
    }

    SECTIONS {
        uuid id PK
        uuid pillar_id FK
        text slug
        text title
        text subtitle
        text description
        text icon
        text gradient_class
        integer display_order
        timestamptz created_at
        timestamptz updated_at
        text token_symbol
        text chain_id
    }

    COMPONENTS {
        uuid id PK
        uuid section_id FK
        text slug
        text title
        text subtitle
        text description
        text icon
        text component_type
        jsonb content
        integer display_order
        timestamptz created_at
        timestamptz updated_at
    }

    USER_JOURNEYS {
        uuid id PK
        uuid user_id FK
        uuid pillar_id FK
        text status
        timestamptz started_at
        timestamptz completed_at
        timestamptz created_at
        timestamptz updated_at
    }

    USER_SECTION_PROGRESS {
        uuid id PK
        uuid user_id FK
        uuid section_id FK
        text status
        timestamptz started_at
        timestamptz completed_at
        timestamptz created_at
        timestamptz updated_at
    }

    USER_COMPONENT_PROGRESS {
        uuid id PK
        uuid user_id FK
        uuid component_id FK
        text status
        jsonb current_state
        jsonb desired_state
        jsonb action_plan
        jsonb results
        timestamptz started_at
        timestamptz completed_at
        timestamptz created_at
        timestamptz updated_at
    }

    USERS {
        uuid id PK
        text email
        boolean email_confirmed
        text encrypted_password
        timestamptz created_at
        timestamptz updated_at
    }
```

## Token Hierarchy Diagram

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
    
    classDef primary fill:#6b7280,stroke:#4b5563,color:white
    classDef superachiever fill:#78716c,stroke:#57534e,color:white
    classDef superachievers fill:#64748b,stroke:#475569,color:white
    classDef personal fill:#f59e0b,stroke:#d97706,color:white
    classDef business fill:#14b8a6,stroke:#0d9488,color:white
    classDef supermind fill:#8b5cf6,stroke:#7c3aed,color:white
    classDef superpuzzle fill:#ef4444,stroke:#dc2626,color:white
    classDef superhuman fill:#f43f5e,stroke:#e11d48,color:white
    classDef supersociety fill:#84cc16,stroke:#65a30d,color:white
    classDef supergenius fill:#0ea5e9,stroke:#0284c7,color:white
    
    class GEN primary
    class SAP superachiever
    class SCQ superachievers
    class PSP personal
    class BSP business
    class SMS supermind
    class SPD superpuzzle
    class SHE superhuman
    class SSA supersociety
    class SGB supergenius
```

## Platform Structure Diagram

```mermaid
graph TD
    subgraph Supercivilization[Supercivilization - GEN]
        SC_GID[Genius ID]
        SC_GEN[GEN Token]
        SC_GAI[Genie AI]
    end
    
    subgraph Superachiever[Superachiever - SAP]
        subgraph PSP[Personal Success Puzzle - PSP]
            PSP_HE[Health & Energy]
            PSP_WC[Wealth & Career]
            PSP_PP[Peace & People]
        end
        
        subgraph BSP[Business Success Puzzle - BSP]
            BSP_FSU[Front-Stage Users]
            BSP_BSA[Back-Stage Admin]
            BSP_BLP[Bottom-Line Profit]
        end
        
        subgraph SMS[Supermind Superpowers - SMS]
            SMS_CD[Current → Desired]
            SMS_DA[Desired → Actions]
            SMS_AR[Actions → Results]
        end
    end
    
    subgraph Superachievers[Superachievers - SCQ]
        subgraph SPD[Superpuzzle Developments - SPD]
            SPD_EI[Enhanced Individuals]
            SPD_AC[Advanced Collectives]
            SPD_BE[Balanced Ecosystems]
        end
        
        subgraph SHE[Superhuman Enhancements - SHE]
            SHE_SA[Superhuman Academy]
            SHE_SU[Superhuman University]
            SHE_SI[Superhuman Institute]
        end
        
        subgraph SSA[Supersociety Advancements - SSA]
            SSA_SC[Supersociety Company]
            SSA_SCM[Supersociety Community]
            SSA_SCY[Supersociety Country]
        end
        
        subgraph SGB[Supergenius Breakthroughs - SGB]
            SGB_SV[Supergenius Ventures]
            SGB_SE[Supergenius Enterprises]
            SGB_SI[Supergenius Industries]
        end
    end
    
    classDef primary fill:#6b7280,stroke:#4b5563,color:white
    classDef superachiever fill:#78716c,stroke:#57534e,color:white
    classDef superachievers fill:#64748b,stroke:#475569,color:white
    classDef personal fill:#f59e0b,stroke:#d97706,color:white
    classDef business fill:#14b8a6,stroke:#0d9488,color:white
    classDef supermind fill:#8b5cf6,stroke:#7c3aed,color:white
    classDef superpuzzle fill:#ef4444,stroke:#dc2626,color:white
    classDef superhuman fill:#f43f5e,stroke:#e11d48,color:white
    classDef supersociety fill:#84cc16,stroke:#65a30d,color:white
    classDef supergenius fill:#0ea5e9,stroke:#0284c7,color:white
    
    class Supercivilization,SC_GID,SC_GEN,SC_GAI primary
    class Superachiever,SAP superachiever
    class Superachievers,SCQ superachievers
    class PSP,PSP_HE,PSP_WC,PSP_PP personal
    class BSP,BSP_FSU,BSP_BSA,BSP_BLP business
    class SMS,SMS_CD,SMS_DA,SMS_AR supermind
    class SPD,SPD_EI,SPD_AC,SPD_BE superpuzzle
    class SHE,SHE_SA,SHE_SU,SHE_SI superhuman
    class SSA,SSA_SC,SSA_SCM,SSA_SCY supersociety
    class SGB,SGB_SV,SGB_SE,SGB_SI supergenius
```

## Token Flow Diagram

```mermaid
flowchart TD
    subgraph System
        Minting[Minting]
        Rewards[Rewards]
        Staking[Staking]
    end
    
    subgraph Users
        User1[User 1]
        User2[User 2]
    end
    
    subgraph Access
        Features[Platform Features]
    end
    
    Minting -->|Award Tokens| User1
    User1 -->|Transfer| User2
    User1 -->|Stake| Staking
    Staking -->|Generate| Rewards
    Rewards -->|Claim| User1
    User1 -->|Access| Features
    
    classDef system fill:#6b7280,stroke:#4b5563,color:white
    classDef users fill:#14b8a6,stroke:#0d9488,color:white
    classDef access fill:#8b5cf6,stroke:#7c3aed,color:white
    
    class Minting,Rewards,Staking system
    class User1,User2 users
    class Features access
```

These diagrams provide a visual representation of the Avolve database schema, token hierarchy, platform structure, and token flow. They can be rendered using Mermaid.js, which is supported by many Markdown viewers and documentation platforms.
