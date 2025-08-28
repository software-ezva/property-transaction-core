# Property Transaction Core Documentation

Welcome to the Property Transaction Core documentation. This system manages real estate transactions with a comprehensive workflow and document management approach.

## 📚 Documentation Structure

### Core Entities

- [User & Profile Management](./entities/user-profile.md) - Users, profiles, and brokerage management
- [Transaction Hierarchy](./entities/transaction-hierarchy.md) - Main transaction flow and related entities
- [Template System](./entities/templates.md) - Reusable templates for workflows and documents

### Enumerations

- [Transaction Enums](./enums/transaction-enums.md) - Transaction types and statuses
- [Document Enums](./enums/document-enums.md) - Document categories and statuses
- [System Enums](./enums/system-enums.md) - Item status and profile types

### Business Concepts

- [Key Concepts](./business/key-concepts.md) - Core business logic and processes
- [Entity Relationships](./business/entity-relationships.md) - How entities relate to each other

## 🏗️ System Architecture

```
Transaction (Central Entity)
├── Property
├── Workflow
│   └── Checklist
│       └── Item
└── Document
```

## 🚀 Quick Start

1. **Users** authenticate and have **Profiles** (Agent or Client)
2. **Agents** create **Transactions** for **Properties**
3. **Workflows** guide the transaction process with **Checklists** and **Items**
4. **Documents** are managed with controlled status transitions
5. **Templates** ensure consistency across similar transactions

## 🔗 Key Relationships

- **Transaction** ← Uses → **TransactionType** & **TransactionStatus**
- **Document** ← Uses → **DocumentCategory** & **DocumentStatus**
- **Item** ← Uses → **ItemStatus**
- **Profile** ← Uses → **ProfileType**

For detailed information, navigate to the specific documentation files above.
