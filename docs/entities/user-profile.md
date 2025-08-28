# User & Profile Management

This section covers user authentication, profiles, and brokerage management.

## User

Represents a system user who can be either a real estate agent or a client. Users are authenticated through Auth0 and can participate in multiple transactions in different roles.

**Business Context:**
Real estate agents manage transactions, upload document templates, customize workflows, and track progress. Clients participate in transactions as buyers, sellers, or lessees.

**Key Properties:**

- `auth0Id`: Auth0 unique identifier for authentication
- `email`: Unique email address
- `firstName`, `lastName`: User's name
- `profile`: Associated user profile

## Profile

Abstract class defining common user profile information.

**Uses Enumerations:**

- `ProfileType`: Defines the type of profile → _See [System Enums](../enums/system-enums.md)_

**Profile Types:**

- `CLIENT`: Client participating in real estate transactions
- `REAL_ESTATE_AGENT`: Real estate agent managing transactions

**Key Properties:**

- `profileType`: Type of profile (client or agent)
- `esignName`: Name for electronic signatures
- `phoneNumber`: Contact phone number

### RealEstateAgentProfile

Extends Profile with real estate agent-specific information.

**Key Properties:**

- `licenseNumber`: Agent's license number
- `mlsNumber`: MLS (Multiple Listing Service) number
- `brokerage`: Associated real estate brokerage

### ClientProfile

Extends Profile with client-specific information.

**Key Properties:**

- `dateOfBirth`: Date of birth for identification

## Brokerage

Represents a real estate company where agents work.

**Key Properties:**

- `name`: Brokerage company name
- `address`: Physical address
- `agents`: List of associated agents

## Relationships

```
User
└── Profile (abstract)
    ├── RealEstateAgentProfile
    │   └── Brokerage
    └── ClientProfile
```

**Navigation:**

- [← Back to Main Documentation](../README.md)
- [Transaction Hierarchy →](./transaction-hierarchy.md)
