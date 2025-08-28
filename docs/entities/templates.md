# Template System

This section covers the template entities that provide reusable standardized processes for workflows and documents.

## WorkflowTemplate (TOP LEVEL)

Defines reusable workflow templates for different transaction types. Templates provide standardized processes that ensure consistency across similar transactions.

**Business Context:**
Workflow templates are pre-configured for specific transaction types (Purchase, Listing for Sale, etc.). When agents start a new transaction, they choose an appropriate template which gets copied with its default set of checklists and items. This standardization ensures all necessary steps are included while allowing for customization as needed.

**Uses Enumerations:**

- `TransactionType`: Defines which transaction type this template applies to → _See [Transaction Enums](../enums/transaction-enums.md)_

**Key Properties:**

- `transactionType`: Applicable transaction type
- `name`: Template name
- `checklistTemplates`: Child checklist templates ↓

## ChecklistTemplate (LEVEL 2)

Defines templates for checklists that will be included in workflow templates.

**Business Context:**
Checklist templates provide pre-configured groups of related tasks for specific aspects of transactions (e.g., financing checklist, inspection checklist). These are copied when a workflow template is instantiated.

**Key Properties:**

- `name`: Template name
- `description`: Checklist description
- `order`: Order in workflow
- `workflowTemplate`: Parent workflow template ↑
- `items`: Child item templates ↓

## ItemTemplate (LEVEL 3)

Defines templates for checklist items that represent specific tasks.

**Business Context:**
Item templates define the individual tasks that agents typically need to complete for specific transaction types. When instantiated, these become the actionable items that agents track progress on.

**Key Properties:**

- `description`: Item description
- `order`: Order in checklist
- `checklistTemplate`: Parent checklist template ↑

## DocumentTemplate

Reusable template for creating documents. Templates ensure consistency and completeness across similar transactions.

**Business Context:**
Real estate agents upload document templates for different categories (Contracts, Disclosures, Insurance, etc.) that can be reused across multiple transactions. When adding documents to transactions, templates are duplicated to create transaction-specific copies, ensuring the original templates remain unchanged for future use.

**Uses Enumerations:**

- `DocumentCategory`: Classifies the template → _See [Document Enums](../enums/document-enums.md)_

**Key Properties:**

- `title`: Template title
- `category`: Document category
- `url`: Template file URL

## Template Hierarchy Visualization

```
WorkflowTemplate (TOP LEVEL)
└── ChecklistTemplate (LEVEL 2)
    └── ItemTemplate (LEVEL 3)

DocumentTemplate (Independent)
```

## Template Usage Flow

1. **Create Templates**: Agents/Admins create workflow and document templates
2. **Choose Template**: When starting a transaction, agent selects appropriate workflow template
3. **Copy & Customize**: Template is copied to transaction and can be customized
4. **Use Documents**: Document templates are duplicated when added to transactions

**Navigation:**

- [← Transaction Hierarchy](./transaction-hierarchy.md)
- [← Back to Main Documentation](../README.md)
- [Transaction Enums →](../enums/transaction-enums.md)
