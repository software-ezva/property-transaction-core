# Glossary of Terms - Property Transaction Core

> **📢 Note:** This documentation has been restructured for better readability. Please use the links below to navigate to specific sections.

## 📚 Documentation Navigation

### Core Entities

- **[User & Profile Management](./entities/user-profile.md)** - Users, profiles, and brokerage management
- **[Transaction Hierarchy](./entities/transaction-hierarchy.md)** - Main transaction flow and related entities
- **[Template System](./entities/templates.md)** - Reusable templates for workflows and documents

### Enumerations

- **[Transaction Enums](./enums/transaction-enums.md)** - Transaction types and statuses
- **[Document Enums](./enums/document-enums.md)** - Document categories and statuses
- **[System Enums](./enums/system-enums.md)** - Item status and profile types

### Business Concepts

- **[Key Concepts](./business/key-concepts.md)** - Core business logic and processes
- **[Entity Relationships](./business/entity-relationships.md)** - How entities relate to each other

## 🚀 Quick Reference

### System Architecture

```
Transaction (Central Entity)
├── Property
├── Workflow
│   └── Checklist
│       └── Item
└── Document
```

### Key Relationships

- **Transaction** ← Uses → **TransactionType** & **TransactionStatus**
- **Document** ← Uses → **DocumentCategory** & **DocumentStatus**
- **Item** ← Uses → **ItemStatus**
- **Profile** ← Uses → **ProfileType**

### Document Status Flow

```
PENDING → READY → WAITING → SIGNED → REJECTED
```

## 📖 Getting Started

1. Start with **[Key Concepts](./business/key-concepts.md)** to understand the business logic
2. Review **[Entity Relationships](./business/entity-relationships.md)** to see how everything connects
3. Dive into specific entities as needed for implementation details

---

_For the complete documentation index, see [README.md](./README.md)_
