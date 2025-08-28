# System Enumerations

This section defines general system enumerations used across different entities.

## ItemStatus

Defines the progress status of individual tasks within checklists.

**Business Context:**
Item status helps agents track progress on specific tasks and ensures nothing falls through the cracks. When items are marked as completed, the system sends notifications to keep all parties informed.

**Values:**

- `NOT_STARTED`: Task has not been started yet
- `IN_PROGRESS`: Task is currently being worked on
- `COMPLETED`: Task has been completed successfully

**Used by:**

- `Item.status`

**Business Examples:**

- `NOT_STARTED`: "Submit financing documents" - agent hasn't begun this task
- `IN_PROGRESS`: "Schedule property inspection" - agent is coordinating with inspector
- `COMPLETED`: "Sign purchase agreement" - all parties have signed the agreement

## ProfileType

Defines the types of user profiles available in the system.

**Business Context:**
Profile types determine user permissions and capabilities within the system. Different profile types have access to different features and can perform different actions.

**Values:**

- `CLIENT`: Client user profile for buyers, sellers, lessees, lessors
- `REAL_ESTATE_AGENT`: Real estate agent profile for licensed agents

**Used by:**

- `Profile.profileType`

**Capabilities by Profile Type:**

### REAL_ESTATE_AGENT

- Create and manage transactions
- Upload and manage document templates
- Customize workflows and checklists
- Update document and item statuses
- Access all transactions they're responsible for

### CLIENT

- View transactions they're involved in
- Access their transaction documents
- Receive notifications about transaction progress
- Limited editing capabilities (as defined by business rules)

## Status Progression Examples

### Item Status Flow

```
NOT_STARTED → IN_PROGRESS → COMPLETED
```

### Profile Workflow

```
User Registration → Profile Creation → Role Assignment (CLIENT/REAL_ESTATE_AGENT)
```

**Navigation:**

- [← Document Enums](./document-enums.md)
- [Key Concepts →](../business/key-concepts.md)
- [← Back to Main Documentation](../README.md)
