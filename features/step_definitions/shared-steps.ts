import { Given } from '@cucumber/cucumber';
import { User } from '../../src/users/entities/user.entity';
import { Property } from '../../src/properties/entities/property.entity';
import { Transaction } from '../../src/transactions/entities/transaction.entity';
import { getServices } from '../support/database-helper';
import { mapToTransactionType } from '../support/transaction-type-mapper';
import { faker } from '@faker-js/faker';
import { expect } from 'expect';
import { ProfessionalType } from '../../src/common/enums';
import { TransactionCoordinatorAgentProfile } from 'src/users/entities/transaction-coordinator-agent-profile.entity';

export interface SharedTestWorld {
  transactionCoordinatorAgent: User;
  interestedParty: User;
  property: Property;
  transaction: Transaction;
}

Given(
  'a transaction of {string} created by the real estate agent {string} for the property {string}',
  async function (
    this: SharedTestWorld,
    transactionType: string,
    agentName: string,
    propertyAddress: string,
  ) {
    const {
      userService,
      transactionCoordinatorAgentProfilesService,
      propertyService,
      transactionService,
    } = getServices();

    // Create real estate agent
    this.transactionCoordinatorAgent = await userService.create(
      faker.string.uuid(),
      faker.internet.email(),
      agentName,
      agentName,
    );

    // Create transaction coordinator agent profile
    const profile =
      await transactionCoordinatorAgentProfilesService.assignTransactionCoordinatorAgentProfile(
        this.transactionCoordinatorAgent.auth0Id,
        {
          esign_name: agentName,
          esign_initials: agentName.charAt(0).toUpperCase(),
          phone_number:
            '+1555' + faker.string.numeric(3) + faker.string.numeric(4),
          license_number: faker.string.alphanumeric(10),
        },
      );

    this.transactionCoordinatorAgent.profile = profile;

    // Create property
    this.property = await propertyService.create({
      address: propertyAddress,
      price: faker.number.int({ min: 100000, max: 1000000 }),
      size: faker.number.int({ min: 500, max: 5000 }),
      bedrooms: faker.number.int({ min: 1, max: 5 }),
      bathrooms: faker.number.int({ min: 1, max: 3 }),
    });

    // Create transaction
    this.transaction = await transactionService.createAndSaveTransaction(
      mapToTransactionType(transactionType),
      this.property,
      this.transactionCoordinatorAgent
        .profile as TransactionCoordinatorAgentProfile,
      null,
      transactionType,
    );

    // Verify transaction exists
    const hasTransaction = await transactionService.existsATransaction(
      this.property,
      this.transactionCoordinatorAgent
        .profile as TransactionCoordinatorAgentProfile,
      null,
      this.transaction.transactionType,
    );
    expect(hasTransaction).toBe(true);
  },
);

Given(
  `exist a user named {string} as interested party in the property added to the transaction as supporting professional`,
  async function (this: SharedTestWorld, userName: string) {
    const {
      userService,
      supportingProfessionalProfilesService,
      transactionService,
    } = getServices();

    this.interestedParty = await userService.create(
      faker.string.uuid(),
      faker.internet.email(),
      userName,
      userName,
    );

    // Create supporting professional profile
    await supportingProfessionalProfilesService.assignSupportingProfessionalProfile(
      this.interestedParty.auth0Id,
      {
        esign_name: userName,
        esign_initials: userName.charAt(0).toUpperCase(),
        phone_number:
          '+1555' + faker.string.numeric(3) + faker.string.numeric(4),
        professional_of: ProfessionalType.ATTORNEY,
      },
    );

    // Add interested party to the transaction as supporting professional
    await transactionService.addSupportingProfessionalToTransaction(
      this.transactionCoordinatorAgent.auth0Id,
      this.transaction.transactionId,
      this.interestedParty.id,
    );
  },
);
