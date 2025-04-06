# 🚀 Avolve Database Documentation

![Avolve Platform](https://via.placeholder.com/1200x300/4F46E5/FFFFFF?text=Avolve+Platform)

> **Version:** 1.0.0  
> **Last Updated:** April 6, 2025  
> **Status:** Active Development

## 📊 Overview

The Avolve platform is built on a sophisticated token-based access control system that aligns with the platform's three main pillars:

1. **Superachiever** - Individual journey of transformation
2. **Superachievers** - Collective journey of transformation
3. **Supercivilization** - Ecosystem journey for transformation

This documentation provides a comprehensive overview of the database schema, token structure, and access control mechanisms that power the Avolve platform.

## 🧩 Token Structure

The token structure follows a hierarchical model that mirrors the platform's three pillars:

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

## 📝 Core Tables

### `tokens`

Stores information about all tokens in the system.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| symbol | text | Token symbol (e.g., GEN, SAP) |
| name | text | Token name |
| description | text | Token description |
| icon_url | text | URL to token icon |
| gradient_class | text | CSS gradient class for UI |
| total_supply | numeric | Total supply of tokens |
| is_primary | boolean | Whether this is a primary token |
| blockchain_contract | text | Contract address (for future blockchain integration) |
| chain_id | text | Blockchain chain ID |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |
| is_active | boolean | Whether the token is active |
| is_transferable | boolean | Whether the token can be transferred |
| transfer_fee | numeric | Fee for token transfers |
| parent_token_id | uuid | Reference to parent token |

### `user_tokens`

Tracks token ownership for each user.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Reference to auth.users |
| token_id | uuid | Reference to tokens |
| balance | numeric | Available token balance |
| staked_balance | numeric | Staked token balance |
| pending_release | numeric | Tokens pending release |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |
| last_updated | timestamptz | Last balance update |

### `token_transactions`

Records all token transactions.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| token_id | uuid | Reference to tokens |
| from_user_id | uuid | Sender (null for minting) |
| to_user_id | uuid | Recipient (null for burning) |
| amount | numeric | Transaction amount |
| transaction_type | text | Type (transfer, reward, etc.) |
| reason | text | Transaction reason |
| tx_hash | text | Blockchain transaction hash |
| created_at | timestamptz | Transaction timestamp |

### `pillars`

Represents the three main pillars of the platform.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| slug | text | URL-friendly identifier |
| title | text | Pillar title |
| subtitle | text | Pillar subtitle |
| description | text | Pillar description |
| icon | text | Icon identifier |
| gradient_class | text | CSS gradient class |
| display_order | integer | Display order |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |
| token_symbol | text | Associated token symbol |
| chain_id | text | Blockchain chain ID |

### `sections`

Represents sections within pillars.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| pillar_id | uuid | Reference to pillars |
| slug | text | URL-friendly identifier |
| title | text | Section title |
| subtitle | text | Section subtitle |
| description | text | Section description |
| icon | text | Icon identifier |
| gradient_class | text | CSS gradient class |
| display_order | integer | Display order |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |
| token_symbol | text | Associated token symbol |
| chain_id | text | Blockchain chain ID |

## 🔄 Entity-Relationship Diagram

```mermaid
erDiagram
    TOKENS ||--o{ USER_TOKENS : "owned by"
    TOKENS ||--o{ TOKEN_TRANSACTIONS : "involved in"
    TOKENS ||--o{ TOKENS : "parent of"
    PILLARS ||--o{ SECTIONS : "contains"
    PILLARS }o--|| TOKENS : "associated with"
    SECTIONS }o--|| TOKENS : "associated with"
    USERS ||--o{ USER_TOKENS : "owns"
    USERS ||--o{ TOKEN_TRANSACTIONS : "participates in"

    TOKENS {
        uuid id PK
        text symbol
        text name
        text description
        text gradient_class
        numeric total_supply
        boolean is_primary
        boolean is_transferable
        uuid parent_token_id FK
    }

    USER_TOKENS {
        uuid id PK
        uuid user_id FK
        uuid token_id FK
        numeric balance
        numeric staked_balance
        numeric pending_release
    }

    TOKEN_TRANSACTIONS {
        uuid id PK
        uuid token_id FK
        uuid from_user_id FK
        uuid to_user_id FK
        numeric amount
        text transaction_type
        text reason
    }

    PILLARS {
        uuid id PK
        text slug
        text title
        text subtitle
        text description
        text gradient_class
        integer display_order
        text token_symbol
    }

    SECTIONS {
        uuid id PK
        uuid pillar_id FK
        text slug
        text title
        text subtitle
        text description
        text gradient_class
        integer display_order
        text token_symbol
    }

    USERS {
        uuid id PK
        text email
        boolean email_confirmed
    }
```

## 🔐 Token-Based Access Control

The Avolve platform implements a token-based access control system that determines user access to different parts of the platform based on token ownership.

### Key Functions

```sql
-- Check if a user has a specific token
has_token(user_id, token_symbol)

-- Check if a user has sufficient token balance
has_sufficient_token_balance(user_id, token_symbol, required_amount)

-- Get token hierarchy
get_token_hierarchy()
```

## 🚀 Platform Structure

The platform structure mirrors the token hierarchy:

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

## 📊 Current State Assessment

### Strengths

1. **Hierarchical Token Structure**: The database successfully implements a hierarchical token structure that aligns with the platform's three pillars.
2. **Pillar-Section Relationship**: The database captures the relationship between pillars and sections, with each section associated with a specific token.
3. **Token Ownership Tracking**: The database includes tables for tracking token ownership and transactions.

### Gaps and Recommendations

1. **Token Staking and Rewards**: 
   - **Gap**: The database has tables for token staking and rewards, but they're not fully implemented.
   - **Recommendation**: Implement the token staking and rewards functionality to enable users to stake tokens and earn rewards.

2. **User Progress Tracking**:
   - **Gap**: While the database has tables for tracking user progress through pillars, sections, and components, they're not fully implemented.
   - **Recommendation**: Implement the user progress tracking functionality to enable users to track their progress through the platform.

3. **Token-Based Access Control**:
   - **Gap**: The database has functions for checking token ownership, but the access control mechanisms aren't fully implemented.
   - **Recommendation**: Implement row-level security policies that use token ownership to control access to different parts of the platform.

4. **Blockchain Integration**:
   - **Gap**: The database includes fields for blockchain integration, but they're not being used yet.
   - **Recommendation**: Prepare for future integration with Psibase by implementing bridge components for data synchronization.

## 🚀 Implementation Roadmap

Based on our assessment, we recommend the following implementation roadmap:

1. **Phase 1: Core Token System (Immediate)**
   - Complete the implementation of token staking and rewards
   - Implement token-based access control with row-level security
   - Create UI components for token visualization

2. **Phase 2: User Experience (Short-term)**
   - Implement user progress tracking
   - Develop gamification features
   - Create engaging onboarding flows

3. **Phase 3: Community Features (Medium-term)**
   - Implement community building features
   - Develop consensus mechanisms
   - Create tools for community governance

4. **Phase 4: Blockchain Preparation (Long-term)**
   - Prepare for Psibase integration
   - Implement bridge components
   - Test data synchronization

5. **Phase 5: Full Decentralization (When Psibase is Available)**
   - Migrate to Psibase for blockchain operations
   - Implement full decentralized features
   - Maintain Supabase for user management

## 📝 Conclusion

The Avolve database is well-structured to support the platform's token-based access system and hierarchical organization. By implementing the recommendations in this document, the platform will be able to deliver a compelling user experience while preparing for future technological advancements.

---

<div style="text-align: center; margin-top: 50px;">
<p>© 2025 Avolve Platform. All rights reserved.</p>
<p>Created with ❤️ by the Avolve Team</p>
</div>
