<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# property-transaction-core

Backend system for real estate transaction management, built with NestJS, TypeORM, and Auth0.

---

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Main Modules](#main-modules)
- [Best Practices](#best-practices)
- [Setup & Run](#setup--run)
- [Swagger & API Docs](#swagger--api-docs)
- [Testing](#testing)
- [Integrations](#integrations)
- [Support](#support)

---

## Overview

This project implements the business core for managing properties, users, workflow templates, and real estate transactions, focusing on traceability, compliance, and process automation.

## Project Structure

```
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── properties/
│   ├── templates/
│   ├── transactions/
│   ├── users/
│   └── common/
├── features/           # BDD tests (Cucumber)
├── test/               # Unit/e2e tests
├── .env                # Environment variables
├── package.json
└── README.md
```

## Main Modules

- **Users & Profiles**: Auth0 integration, agent and client profiles.
- **Properties**: Full CRUD for real estate properties.
- **Templates**: Management of reusable workflows/checklists.
- **Transactions**: Complete lifecycle of real estate transactions.

## Best Practices

- **Swagger**: Comprehensive endpoint documentation.
- **Structured Logger**: Only essential logs (errors, warnings, critical operations like DELETE).
- **Error Handling**: Custom exceptions and HttpException.
- **Validation**: DTOs and class-validator.
- **Modularity**: Clear separation by domain.

## Setup & Run

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure the `.env` file with your database and Auth0 credentials.
3. Run the project:
   ```bash
   npm run start:dev
   ```

## Swagger & API Docs

- Access interactive documentation at `/api` after starting the server.
- All endpoints are documented with request/response, errors, and descriptions.

## Testing

- Unit: `npm run test`
- End-to-end: `npm run test:e2e`
- BDD (Cucumber): `npm run test:cucumber`
- Coverage: `npm run test:cov`
- See `TEST-README.md` for details.

## Integrations

- **Auth0**: JWT authentication and authorization.
- **TypeORM**: Relational database ORM.
- **Cucumber**: BDD testing.
- **Swagger**: Public API and interactive docs.

## Support

For technical questions, see this README, `TEST-README.md`, and `BRSG-README.md` for business details.

---

© property-transaction-core 2025
