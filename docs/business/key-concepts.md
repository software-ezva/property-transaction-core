# Key Business Concepts

This section explains the core business logic and processes that drive the Property Transaction Core system.

## Transaction Workflow Management

A workflow defines the sequence of activities and documents needed to complete a real estate transaction. Each transaction type (Purchase, Listing for Sale, Lease, etc.) can have a specific workflow template that guides the process from start to closing.

**Key Features:**

- **Step-by-step guidance**: Workflows break down complex transactions into manageable steps
- **Customization**: Agents can add checklists and items to accommodate unique transaction requirements
- **Progress tracking**: Clear visibility into what's done and what's pending
- **Standardization**: Templates ensure consistent processes across similar transactions

**Business Example:**
When an agent starts a "Purchase" transaction, they select the "Purchase Workflow Template" which automatically creates:

- Financing checklist (with items like "Submit loan application", "Get pre-approval")
- Inspection checklist (with items like "Schedule home inspection", "Review inspection report")
- Closing checklist (with items like "Schedule final walkthrough", "Attend closing")

## Template-Based Standardization

Templates (for workflows, checklists, items, and documents) allow creating standardized processes that can be reused for different transactions of the same type. This ensures consistency and completeness while maintaining flexibility for customization.

**Benefits:**

- **Consistency**: All similar transactions follow the same proven process
- **Completeness**: Templates include all necessary steps, reducing the chance of missing important tasks
- **Efficiency**: Agents don't have to recreate workflows from scratch
- **Flexibility**: Templates can be customized for unique situations

**Template Usage Flow:**

1. Create reusable templates for common transaction types
2. When starting a transaction, copy the appropriate template
3. Customize the copied workflow as needed for the specific transaction
4. Execute the workflow, tracking progress through completion

## Document Lifecycle Management

The system manages the complete lifecycle of documents through controlled status transitions. This ensures proper document flow and prevents unauthorized or invalid status changes.

**Document Status Flow:**

```
PENDING → READY → WAITING → SIGNED
    ↑       ↓        ↓         ↓
    └───────┴────────┴─────────┴→ REJECTED
```

**Business Rules:**

- Documents start as **PENDING** when created from templates
- Only **PENDING** documents can be marked **READY**
- **READY** documents can go to **WAITING** (awaiting signatures), **SIGNED** (completed), or back to **PENDING**
- **WAITING** documents can be **SIGNED** or returned to **PENDING**
- **SIGNED** documents can only be **REJECTED** if issues are discovered
- **REJECTED** is a terminal state - no further transitions allowed

**Example Scenario:**

1. Agent creates "Purchase Agreement" from template (**PENDING**)
2. Agent reviews and finalizes document (**READY**)
3. Document sent to client for signature (**WAITING**)
4. Client signs the document (**SIGNED**)
5. If issues found later, document can be marked **REJECTED**

## Progress Tracking and Notifications

Items within checklists track the progress of specific tasks with three states: Not Started, In Progress, and Completed. The system provides automated notifications to keep all stakeholders informed.

**Progress States:**

- **NOT_STARTED**: Task is pending and hasn't been worked on
- **IN_PROGRESS**: Task is currently being handled
- **COMPLETED**: Task is finished and verified

**Notification System:**

- When items are marked **COMPLETED**, automatic notifications are sent
- Relevant parties (agents, clients, other stakeholders) receive updates
- Ensures everyone stays informed of transaction progress
- Reduces communication gaps and delays

**Example:**
When an agent marks "Home inspection completed" as **COMPLETED**, the system automatically notifies:

- The client (buyer/seller)
- The loan officer (if financing involved)
- Any other agents involved in the transaction

## Transaction Authorization and Security

The system implements role-based access controls ensuring only authorized users can access and modify transaction data.

**Access Control Rules:**

- **Agents**: Can access all transactions they're responsible for
- **Clients**: Can only access transactions they're involved in
- **Read vs. Write**: Different permission levels for viewing vs. modifying data
- **Document Access**: Controlled access to sensitive documents based on user role

**Security Features:**

- Auth0 integration for secure authentication
- Role-based permissions (Agent vs. Client profiles)
- Transaction-level authorization checks
- Audit trails for all changes (through entity timestamps)

This comprehensive security model ensures data privacy and regulatory compliance while enabling efficient collaboration between all parties in real estate transactions.

**Navigation:**

- [← System Enums](../enums/system-enums.md)
- [Entity Relationships →](./entity-relationships.md)
- [← Back to Main Documentation](../README.md)
