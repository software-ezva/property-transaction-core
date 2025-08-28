# Document Enumerations

This section defines the enumerations related to document management.

## DocumentStatus

Defines the lifecycle status of documents with controlled transitions to ensure proper workflow.

**Business Context:**
Document status controls what actions can be performed on documents and ensures proper workflow. The system enforces strict transition rules to maintain data integrity and business compliance.

**Values:**

- `PENDING`: Document is pending review or action
- `READY`: Document is ready for the next action
- `WAITING`: Document is waiting for response from parties
- `SIGNED`: Document has been signed and completed
- `REJECTED`: Document was rejected and needs revision
- `ARCHIVED`: Document has been archived (not currently used in transitions)

**Allowed Transitions:**

- `PENDING` → `READY`
- `READY` → `WAITING`, `SIGNED`, `PENDING`
- `WAITING` → `SIGNED`, `PENDING`
- `SIGNED` → `REJECTED`
- `REJECTED` → (no transitions allowed - terminal state)

**Used by:**

- `Document.status`

## DocumentCategory

Classifies documents by their purpose in the real estate transaction process.

**Business Context:**
Document categories help organize the various types of paperwork required in real estate transactions. Each category represents a different aspect of the transaction process.

**Values:**

- `CONTRACT_AND_NEGOTIATION`: Contracts and negotiation documents
- `TITLE_AND_OWNERSHIP`: Title reports, deeds, ownership documents
- `DISCLOSURE`: Property disclosure documents
- `CLOSING_AND_FINANCING`: Closing documents and financing paperwork
- `AGREEMENTS`: Real estate agent agreements and contracts
- `LISTINGS_AND_MARKETING`: Property listings and marketing materials
- `PROPERTY_MANAGEMENT`: Property management related documents
- `INSURANCE`: Insurance policies and related documents
- `MISCELLANEOUS`: Other documents not fitting above categories

**Used by:**

- `Document.category`
- `DocumentTemplate.category`

## Document Status Flow

```
PENDING → READY → WAITING → SIGNED → REJECTED
    ↑       ↓        ↓         ↓
    └───────┴────────┴─────────┘
            (Return to PENDING)
```

**Key Business Rules:**

- Documents cannot skip status levels
- Once REJECTED, documents cannot be changed (terminal state)
- SIGNED documents can only go to REJECTED (e.g., if issues discovered later)

**Navigation:**

- [← Transaction Enums](./transaction-enums.md)
- [System Enums →](./system-enums.md)
- [← Back to Main Documentation](../README.md)
