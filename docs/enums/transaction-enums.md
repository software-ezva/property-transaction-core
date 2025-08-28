# Transaction Enumerations

This section defines the enumerations related to transaction management.

## TransactionType

Defines the types of real estate transactions available in the system.

**Business Context:**
Different transaction types require different workflows and processes. The system supports the most common real estate transaction types.

**Values:**

- `PURCHASE`: Property purchase transaction
- `LISTING_FOR_SALE`: Property listing for sale transaction
- `LISTING_FOR_LEASE`: Property listing for lease transaction
- `LEASE`: Property lease transaction
- `OTHER`: Other types of transactions not covered above

**Used by:**

- `Transaction.transactionType`
- `WorkflowTemplate.transactionType`

## TransactionStatus

Defines the lifecycle status of a transaction as it progresses through the process.

**Business Context:**
Transaction status helps agents and clients understand where they are in the transaction process and what actions might be needed next.

**Values:**

- `IN_PREPARATION`: Transaction is being prepared and set up
- `ACTIVE`: Transaction is active and in progress
- `UNDER_CONTRACT`: Property is under contract (for purchases/sales)
- `SOLD_LEASED`: Transaction completed successfully
- `TERMINATED`: Transaction was terminated before completion
- `WITHDRAWN`: Transaction was withdrawn by one of the parties

**Used by:**

- `Transaction.status`

## Status Flow Examples

### Purchase Transaction Flow

```
IN_PREPARATION → ACTIVE → UNDER_CONTRACT → SOLD_LEASED
                    ↓           ↓
               TERMINATED   WITHDRAWN
```

### Listing Transaction Flow

```
IN_PREPARATION → ACTIVE → SOLD_LEASED
                    ↓
               WITHDRAWN
```

**Navigation:**

- [← Templates](../entities/templates.md)
- [Document Enums →](./document-enums.md)
- [← Back to Main Documentation](../README.md)
