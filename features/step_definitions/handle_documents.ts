import { Given } from '@cucumber/cucumber';
//import { getRepositories, getServices } from '../support/database-helper';
//import { faker } from '@faker-js/faker';
import { User } from 'src/users/entities/user.entity';
//import { expect } from 'expect';
import { getServices } from '../support/database-helper';
import { faker } from '@faker-js/faker';
import { expect } from 'expect';

export interface TestWorld {
  user: User;
}

Given(
  `a real estate agent named {string}`,
  async function (this: TestWorld, agentName: string) {
    const { userService, profileService } = getServices();
    // Create real estate agent
    this.user = await userService.create(
      faker.string.uuid(),
      faker.internet.email(),
      agentName,
      agentName,
    );

    // Create real estate agent profile
    await profileService.assignAgentProfile(this.user.auth0Id, {
      esign_name: agentName,
      esign_initials: agentName.charAt(0).toUpperCase(),
      license_number: faker.string.alphanumeric(10),
    });
    expect(true).toBe(true);
  },
);

// Given(`a document template category {string} exists`, (arg0: string) => {
//   // [Given] Sets up the initial state of the system.
// });

// When(
//   `the real estate agent uploads a document template named {string} to the category {string}`,
//   (arg0: string, arg1: string) => {
//     // [When] Describes the action or event that triggers the scenario.
//   },
// );

// Then(
//   `the document template {string} should be saved in the category {string}`,
//   (arg0: string, arg1: string) => {
//     // [Then] Describes the expected outcome or result of the scenario.
//   },
// );

// Given(
//   `a transaction created by the real estate agent {string} for the property {string}`,
//   (arg0: string, arg1: string) => {
//     // [Given] Sets up the initial state of the system.
//   },
// );

// When(
//   `the real estate agent adds a document named {string} from document templates to the transaction`,
//   (arg0: string) => {
//     // [When] Describes the action or event that triggers the scenario.
//   },
// );

// Then(
//   `the document {string} should be duplicated in the transaction`,
//   (arg0: string) => {
//     // [Then] Describes the expected outcome or result of the scenario.
//   },
// );

// Then(`its status should be {string}`, (arg0: string) => {
//   // [Then] Describes the expected outcome or result of the scenario.
// });

// Given(`the transaction has a document named {string}`, (arg0: string) => {
//   // [Given] Sets up the initial state of the system.
// });

// When(`the agent completes the document {string}`, (arg0: string) => {
//   // [When] Describes the action or event that triggers the scenario.
// });

// Then(
//   `the document {string} should be marked as {string}`,
//   (arg0: string, arg1: string) => {
//     // [Then] Describes the expected outcome or result of the scenario.
//   },
// );

// When(
//   `the real estate agent removes the document {string} from the transaction`,
//   (arg0: string) => {
//     // [When] Describes the action or event that triggers the scenario.
//   },
// );

// Then(
//   `the document {string} should no longer be associated with the transaction`,
//   (arg0: string) => {
//     // [Then] Describes the expected outcome or result of the scenario.
//   },
// );
