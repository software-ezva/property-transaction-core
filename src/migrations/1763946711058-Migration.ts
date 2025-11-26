import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1763946711058 implements MigrationInterface {
  name = 'Migration1763946711058';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "properties" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "address" character varying(255) NOT NULL, "price" numeric(10,2) NOT NULL, "size" integer NOT NULL, "bedrooms" integer NOT NULL, "bathrooms" integer NOT NULL, "description" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2d83bfa0b9fcd45dee1785af44d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "items_status_enum" AS ENUM('not_started', 'in_progress', 'completed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "items" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "description" text NOT NULL, "order" integer NOT NULL DEFAULT '0', "status" "items_status_enum" NOT NULL DEFAULT 'not_started', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "expectClosingDate" date DEFAULT ('now'::text)::date, "checklistId" uuid, CONSTRAINT "PK_ba5885359424c15ca6b9e79bcf6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "checklists" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying(100) NOT NULL, "order" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "workflowId" uuid, CONSTRAINT "PK_336ade2047f3d713e1afa20d2c6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "workflows" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying(100) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "transactionId" uuid, CONSTRAINT "REL_65936bb65784bb384ef977bed4" UNIQUE ("transactionId"), CONSTRAINT "PK_5b5757cc1cd86268019fef52e0c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "signatures" ("signatureId" uuid NOT NULL DEFAULT gen_random_uuid(), "isSigned" boolean NOT NULL DEFAULT false, "signedAt" TIMESTAMP, "rejectionReason" character varying, "documentId" uuid, "signerId" uuid, CONSTRAINT "PK_6cc0985d49f5058f0499234f22a" PRIMARY KEY ("signatureId"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "documents_category_enum" AS ENUM('Contract and Negotiation', 'Title and Ownership', 'Disclosure', 'Closing and Financing', 'Real Estate Agent Agreements', 'Real Estate Agent Listings and Marketing', 'Property Management', 'Insurance', 'Miscellaneous')`,
    );
    await queryRunner.query(
      `CREATE TYPE "documents_status_enum" AS ENUM('Pending', 'In Edition', 'Awaiting Signatures', 'Signed', 'Rejected', 'Archived')`,
    );
    await queryRunner.query(
      `CREATE TABLE "documents" ("documentId" uuid NOT NULL DEFAULT gen_random_uuid(), "title" character varying NOT NULL, "category" "documents_category_enum" NOT NULL, "filePath" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "status" "documents_status_enum" NOT NULL DEFAULT 'Pending', "transactionTransactionId" uuid NOT NULL, CONSTRAINT "PK_0592c7aa6895bb9fe3dcec8b6f6" PRIMARY KEY ("documentId"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "transactions_transactiontype_enum" AS ENUM('Purchase', 'Listing for Sale', 'Listing for Lease', 'Lease', 'Other')`,
    );
    await queryRunner.query(
      `CREATE TYPE "transactions_status_enum" AS ENUM('in_preparation', 'active', 'under_contract', 'sold_leased', 'terminated', 'withdrawn')`,
    );
    await queryRunner.query(
      `CREATE TABLE "transactions" ("transactionId" uuid NOT NULL DEFAULT gen_random_uuid(), "transactionType" "transactions_transactiontype_enum", "status" "transactions_status_enum" NOT NULL DEFAULT 'in_preparation', "additionalNotes" character varying(500), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "propertyId" uuid NOT NULL, "agentId" uuid NOT NULL, "clientId" uuid, CONSTRAINT "PK_1eb69759461752029252274c105" PRIMARY KEY ("transactionId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "auth0Id" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "firstName" character varying(100), "lastName" character varying(100), "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_d7925ac1be04ad9d0f11c14d707" UNIQUE ("auth0Id"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")); COMMENT ON COLUMN "users"."auth0Id" IS 'Auth0 User ID'; COMMENT ON COLUMN "users"."email" IS 'User email address'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d7925ac1be04ad9d0f11c14d70" ON "users" ("auth0Id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `,
    );
    await queryRunner.query(
      `CREATE TYPE "profiles_profiletype_enum" AS ENUM('client', 'real_estate_agent', 'supporting_professional', 'broker')`,
    );
    await queryRunner.query(
      `CREATE TYPE "profiles_professionalof_enum" AS ENUM('Attorney', 'Appraiser', 'Mortgage', 'Home Improvement', 'Utilities', 'Home Security', 'Home Inspection', 'Moving Storage', 'Home Warranty', 'Home Insurance', 'Escrow Title', 'Other Home Services')`,
    );
    await queryRunner.query(
      `CREATE TABLE "profiles" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "profileType" "profiles_profiletype_enum" NOT NULL, "esignName" character varying(100), "esignInitials" character varying(5), "phoneNumber" character varying(15) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "licenseNumber" character varying(50), "mlsNumber" character varying(100), "professionalOf" "profiles_professionalof_enum", "dateOfBirth" date, "profile_type" character varying NOT NULL, "userId" uuid, "brokerageId" uuid, CONSTRAINT "UQ_9b0b2f869f8177b9110738c01f2" UNIQUE ("licenseNumber"), CONSTRAINT "UQ_9b0b2f869f8177b9110738c01f2" UNIQUE ("licenseNumber"), CONSTRAINT "REL_315ecd98bd1a42dcf2ec4e2e98" UNIQUE ("userId"), CONSTRAINT "PK_8e520eb4da7dc01d0e190447c8e" PRIMARY KEY ("id")); COMMENT ON COLUMN "profiles"."esignName" IS 'Name used for electronic signatures'; COMMENT ON COLUMN "profiles"."esignInitials" IS 'Initials used for electronic signatures'; COMMENT ON COLUMN "profiles"."phoneNumber" IS 'Phone number (US format)'; COMMENT ON COLUMN "profiles"."mlsNumber" IS 'MLS number'; COMMENT ON COLUMN "profiles"."professionalOf" IS 'Type of supporting professional (Attorney, Appraiser, Other)'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c032afd42b5902f7c94aab8176" ON "profiles" ("profile_type") `,
    );
    await queryRunner.query(
      `CREATE TABLE "brokerages" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying(200) NOT NULL, "address" character varying(255), "county" character varying(100), "city" character varying(100), "state" character varying(10), "phoneNumber" character varying(15), "email" character varying(100), "accessCode" character varying(6) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_d1eea12d6b4d76cf297bb2e4b1f" UNIQUE ("accessCode"), CONSTRAINT "PK_87697a7aaabf73e99f3a2435662" PRIMARY KEY ("id")); COMMENT ON COLUMN "brokerages"."name" IS 'Name of the brokerage company'; COMMENT ON COLUMN "brokerages"."address" IS 'Physical address of the brokerage'; COMMENT ON COLUMN "brokerages"."county" IS 'County where the brokerage is located'; COMMENT ON COLUMN "brokerages"."city" IS 'City where the brokerage is located'; COMMENT ON COLUMN "brokerages"."state" IS 'State abbreviation (e.g., CA, NY)'; COMMENT ON COLUMN "brokerages"."phoneNumber" IS 'Main phone number of the brokerage'; COMMENT ON COLUMN "brokerages"."email" IS 'Email address of the brokerage'; COMMENT ON COLUMN "brokerages"."accessCode" IS 'Access code for profiles to join the brokerage (format: ABC123 - 3 uppercase letters + 3 digits)'`,
    );
    await queryRunner.query(
      `CREATE TYPE "workflow_templates_transactiontype_enum" AS ENUM('Purchase', 'Listing for Sale', 'Listing for Lease', 'Lease', 'Other')`,
    );
    await queryRunner.query(
      `CREATE TABLE "workflow_templates" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "transactionType" "workflow_templates_transactiontype_enum" NOT NULL, "name" character varying(100) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_de336a1fce23ad3261d49423eae" PRIMARY KEY ("id")); COMMENT ON COLUMN "workflow_templates"."transactionType" IS 'Type of real estate transaction this template applies to'; COMMENT ON COLUMN "workflow_templates"."name" IS 'Name of the workflow template'`,
    );
    await queryRunner.query(
      `CREATE TABLE "checklist_templates" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying(100) NOT NULL, "description" text NOT NULL, "order" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "workflowTemplateId" uuid, CONSTRAINT "PK_e6d17651d110bbac45cf07e44fa" PRIMARY KEY ("id")); COMMENT ON COLUMN "checklist_templates"."name" IS 'Name of the checklist template'; COMMENT ON COLUMN "checklist_templates"."description" IS 'Description of the checklist template'; COMMENT ON COLUMN "checklist_templates"."order" IS 'Order position for this checklist in the workflow'`,
    );
    await queryRunner.query(
      `CREATE TABLE "item_templates" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "description" text, "order" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "checklistTemplateId" uuid, CONSTRAINT "PK_98b06be6fac6be098e944a2eefb" PRIMARY KEY ("id")); COMMENT ON COLUMN "item_templates"."description" IS 'Description of the item in the checklist template'; COMMENT ON COLUMN "item_templates"."order" IS 'Order position for this item in the checklist'`,
    );
    await queryRunner.query(
      `CREATE TYPE "document_templates_category_enum" AS ENUM('Contract and Negotiation', 'Title and Ownership', 'Disclosure', 'Closing and Financing', 'Real Estate Agent Agreements', 'Real Estate Agent Listings and Marketing', 'Property Management', 'Insurance', 'Miscellaneous')`,
    );
    await queryRunner.query(
      `CREATE TABLE "document_templates" ("documentTemplateId" uuid NOT NULL DEFAULT gen_random_uuid(), "title" character varying NOT NULL, "category" "document_templates_category_enum" NOT NULL, "filePath" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a98261986ef083b876fcc9d9f62" PRIMARY KEY ("documentTemplateId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "transactions_supporting_professionals_users" ("transactionsTransactionId" uuid NOT NULL, "usersId" uuid NOT NULL, CONSTRAINT "PK_359a889a542eebbd9cee4a71275" PRIMARY KEY ("transactionsTransactionId", "usersId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_708d98fc6a9af324609c0f0c1b" ON "transactions_supporting_professionals_users" ("transactionsTransactionId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cf0f5818b8d17105e2b733b43c" ON "transactions_supporting_professionals_users" ("usersId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "brokerage_supporting_professionals" ("supporting_professional_id" uuid NOT NULL, "brokerage_id" uuid NOT NULL, CONSTRAINT "PK_51776e2d03830db55f9ceaa0f02" PRIMARY KEY ("supporting_professional_id", "brokerage_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f7087b71746b4cb4daf4b289ba" ON "brokerage_supporting_professionals" ("supporting_professional_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b6db85a6dc52829a19d2bc7c04" ON "brokerage_supporting_professionals" ("brokerage_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "items" ADD CONSTRAINT "FK_ee2889b532752079461d0d6b13b" FOREIGN KEY ("checklistId") REFERENCES "checklists"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "checklists" ADD CONSTRAINT "FK_2f019a4ca48835dd86599a685e6" FOREIGN KEY ("workflowId") REFERENCES "workflows"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "workflows" ADD CONSTRAINT "FK_65936bb65784bb384ef977bed49" FOREIGN KEY ("transactionId") REFERENCES "transactions"("transactionId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "signatures" ADD CONSTRAINT "FK_7be2557c5208359daf74f35a772" FOREIGN KEY ("documentId") REFERENCES "documents"("documentId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "signatures" ADD CONSTRAINT "FK_752c037022f75add96ab8707378" FOREIGN KEY ("signerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ADD CONSTRAINT "FK_a252a11aeb0e72053c8ff958d96" FOREIGN KEY ("transactionTransactionId") REFERENCES "transactions"("transactionId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_911d34dfe5af3e352831291ae0e" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_b7f013fd7dc39795d068db41293" FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_605be897e18635c785596cbaa9c" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" ADD CONSTRAINT "FK_315ecd98bd1a42dcf2ec4e2e985" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" ADD CONSTRAINT "FK_ffb72c337c9ee32b2632209975c" FOREIGN KEY ("brokerageId") REFERENCES "brokerages"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "checklist_templates" ADD CONSTRAINT "FK_7d0c49f29dcaf39f2a481d29526" FOREIGN KEY ("workflowTemplateId") REFERENCES "workflow_templates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_templates" ADD CONSTRAINT "FK_9f198bc6d832703ef9de001c86f" FOREIGN KEY ("checklistTemplateId") REFERENCES "checklist_templates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_supporting_professionals_users" ADD CONSTRAINT "FK_708d98fc6a9af324609c0f0c1bd" FOREIGN KEY ("transactionsTransactionId") REFERENCES "transactions"("transactionId") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_supporting_professionals_users" ADD CONSTRAINT "FK_cf0f5818b8d17105e2b733b43cb" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "brokerage_supporting_professionals" ADD CONSTRAINT "FK_f7087b71746b4cb4daf4b289ba9" FOREIGN KEY ("supporting_professional_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "brokerage_supporting_professionals" ADD CONSTRAINT "FK_b6db85a6dc52829a19d2bc7c04d" FOREIGN KEY ("brokerage_id") REFERENCES "brokerages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "brokerage_supporting_professionals" DROP CONSTRAINT "FK_b6db85a6dc52829a19d2bc7c04d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "brokerage_supporting_professionals" DROP CONSTRAINT "FK_f7087b71746b4cb4daf4b289ba9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_supporting_professionals_users" DROP CONSTRAINT "FK_cf0f5818b8d17105e2b733b43cb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions_supporting_professionals_users" DROP CONSTRAINT "FK_708d98fc6a9af324609c0f0c1bd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_templates" DROP CONSTRAINT "FK_9f198bc6d832703ef9de001c86f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "checklist_templates" DROP CONSTRAINT "FK_7d0c49f29dcaf39f2a481d29526"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" DROP CONSTRAINT "FK_ffb72c337c9ee32b2632209975c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" DROP CONSTRAINT "FK_315ecd98bd1a42dcf2ec4e2e985"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_605be897e18635c785596cbaa9c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_b7f013fd7dc39795d068db41293"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_911d34dfe5af3e352831291ae0e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" DROP CONSTRAINT "FK_a252a11aeb0e72053c8ff958d96"`,
    );
    await queryRunner.query(
      `ALTER TABLE "signatures" DROP CONSTRAINT "FK_752c037022f75add96ab8707378"`,
    );
    await queryRunner.query(
      `ALTER TABLE "signatures" DROP CONSTRAINT "FK_7be2557c5208359daf74f35a772"`,
    );
    await queryRunner.query(
      `ALTER TABLE "workflows" DROP CONSTRAINT "FK_65936bb65784bb384ef977bed49"`,
    );
    await queryRunner.query(
      `ALTER TABLE "checklists" DROP CONSTRAINT "FK_2f019a4ca48835dd86599a685e6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "items" DROP CONSTRAINT "FK_ee2889b532752079461d0d6b13b"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_b6db85a6dc52829a19d2bc7c04"`);
    await queryRunner.query(`DROP INDEX "IDX_f7087b71746b4cb4daf4b289ba"`);
    await queryRunner.query(`DROP TABLE "brokerage_supporting_professionals"`);
    await queryRunner.query(`DROP INDEX "IDX_cf0f5818b8d17105e2b733b43c"`);
    await queryRunner.query(`DROP INDEX "IDX_708d98fc6a9af324609c0f0c1b"`);
    await queryRunner.query(
      `DROP TABLE "transactions_supporting_professionals_users"`,
    );
    await queryRunner.query(`DROP TABLE "document_templates"`);
    await queryRunner.query(`DROP TYPE "document_templates_category_enum"`);
    await queryRunner.query(`DROP TABLE "item_templates"`);
    await queryRunner.query(`DROP TABLE "checklist_templates"`);
    await queryRunner.query(`DROP TABLE "workflow_templates"`);
    await queryRunner.query(
      `DROP TYPE "workflow_templates_transactiontype_enum"`,
    );
    await queryRunner.query(`DROP TABLE "brokerages"`);
    await queryRunner.query(`DROP INDEX "IDX_c032afd42b5902f7c94aab8176"`);
    await queryRunner.query(`DROP TABLE "profiles"`);
    await queryRunner.query(`DROP TYPE "profiles_professionalof_enum"`);
    await queryRunner.query(`DROP TYPE "profiles_profiletype_enum"`);
    await queryRunner.query(`DROP INDEX "IDX_97672ac88f789774dd47f7c8be"`);
    await queryRunner.query(`DROP INDEX "IDX_d7925ac1be04ad9d0f11c14d70"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`DROP TYPE "transactions_status_enum"`);
    await queryRunner.query(`DROP TYPE "transactions_transactiontype_enum"`);
    await queryRunner.query(`DROP TABLE "documents"`);
    await queryRunner.query(`DROP TYPE "documents_status_enum"`);
    await queryRunner.query(`DROP TYPE "documents_category_enum"`);
    await queryRunner.query(`DROP TABLE "signatures"`);
    await queryRunner.query(`DROP TABLE "workflows"`);
    await queryRunner.query(`DROP TABLE "checklists"`);
    await queryRunner.query(`DROP TABLE "items"`);
    await queryRunner.query(`DROP TYPE "items_status_enum"`);
    await queryRunner.query(`DROP TABLE "properties"`);
  }
}
