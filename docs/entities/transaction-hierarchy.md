# Transaction Hierarchy

This section covers the main transaction flow and all related entities that support the transaction process.

## Transaction (TOP LEVEL)

Represents a real estate transaction between parties. This is the central entity that orchestrates the entire property transaction process.

**Business Context:**
A transaction can be a Purchase, Listing for Sale, Listing for Lease, Lease, or Other type. Each transaction follows a structured workflow that guides agents step-by-step through the process. Agents can customize workflows by adding checklists and items, and manage all related documents with proper status tracking.

**Uses Enumerations:**

- `TransactionType`: Defines the type of transaction → _See [Transaction Enums](../enums/transaction-enums.md)_
- `TransactionStatus`: Defines the current status → _See [Transaction Enums](../enums/transaction-enums.md)_

**Key Properties:**

- `transactionType`: Type of transaction
- `status`: Current transaction status
- `property`: Property involved ↓
- `agent`: Responsible real estate agent
- `client`: Involved client (optional)
- `workflow`: Associated workflow ↓
- `documents`: Transaction documents ↓

## Property

Represents a real estate property involved in the transaction.

**Key Properties:**

- `address`: Property address
- `price`: Property price
- `size`: Size in square feet
- `bedrooms`, `bathrooms`: Number of rooms

## Workflow (LEVEL 2)

Defines the process and stages of a transaction. Each transaction type can have a specific workflow template that gets copied and customized for individual transactions.

**Business Context:**
Workflows are created from templates (e.g., "Listing for sale" template) and can be customized by agents. They contain a default set of checklists that guide the transaction process. Agents can add new checklists to accommodate specific transaction needs, ensuring no steps are missed in complex real estate deals.

**Key Properties:**

- `name`: Workflow name
- `transaction`: Parent transaction ↑
- `checklists`: List of workflow checklists ↓

### Checklist (LEVEL 3)

Groups related items within a workflow. Checklists organize tasks logically (e.g., financing, inspections, closing procedures).

**Business Context:**
Checklists help agents organize related tasks in logical groups. They can be added dynamically to workflows as transaction needs evolve. Each checklist maintains an order to ensure proper sequencing of activities in the transaction process.

**Key Properties:**

- `name`: Checklist name
- `order`: Display order
- `workflow`: Parent workflow ↑
- `items`: Checklist items ↓

#### Item (LEVEL 4)

Represents a specific task within a checklist. These are actionable steps that agents must complete during the transaction.

**Business Context:**
Items are the actual work tasks that agents perform (e.g., "Sign purchase agreement", "Submit financing documents"). Agents can mark items as "Not Started", "In Progress", or "Completed". When items are marked as completed, the system sends notifications to relevant parties. Items can be added to checklists to accommodate unique transaction requirements.

**Uses Enumerations:**

- `ItemStatus`: Defines the progress status → _See [System Enums](../enums/system-enums.md)_

**Key Properties:**

- `description`: Task description
- `status`: Item status
- `expectClosingDate`: Expected completion date
- `checklist`: Parent checklist ↑

## Document (LEVEL 2)

Represents a specific document associated with a transaction. Documents are created from templates and follow a controlled lifecycle with status transitions.

**Business Context:**
Documents are the paperwork essential for real estate transactions (Purchase Agreements, Title Reports, Disclosures, etc.). They are created from reusable templates and categorized by purpose. The system enforces a strict status workflow: documents start as "Pending", can be marked "Ready" for action, move to "Waiting" for responses, get "Signed" when completed, or "Rejected" if issues arise. This ensures proper document flow and prevents unauthorized status changes.

**Uses Enumerations:**

- `DocumentCategory`: Classifies the document → _See [Document Enums](../enums/document-enums.md)_
- `DocumentStatus`: Defines the lifecycle status → _See [Document Enums](../enums/document-enums.md)_

**Key Properties:**

- `title`: Document title
- `category`: Document category
- `status`: Document status
- `url`: File URL
- `transaction`: Parent transaction ↑

## Hierarchy Visualization

```
Transaction (TOP LEVEL)
├── Property
├── Workflow (LEVEL 2)
│   └── Checklist (LEVEL 3)
│       └── Item (LEVEL 4)
└── Document (LEVEL 2)
```

**Navigation:**

- [← User & Profile Management](./user-profile.md)
- [Template System →](./templates.md)
- [← Back to Main Documentation](../README.md)
