import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1765649871474 implements MigrationInterface {
    name = 'Migration1765649871474'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_b7f013fd7dc39795d068db41293"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_605be897e18635c785596cbaa9c"`);
        await queryRunner.query(`CREATE TABLE "item_updates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "itemId" uuid NOT NULL, "createdBy" character varying NOT NULL, "createdByName" character varying NOT NULL, CONSTRAINT "PK_b4632fd99dfaa27ce57c333fa1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "transactions_supporting_professionals_profiles" ("transactionsTransactionId" uuid NOT NULL, "profilesId" uuid NOT NULL, CONSTRAINT "PK_99aae25296e643b615c1d6306df" PRIMARY KEY ("transactionsTransactionId", "profilesId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b1a464ec4dbb0ba3350bfe07ab" ON "transactions_supporting_professionals_profiles" ("transactionsTransactionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a8d5b35a55edffb79c4192b95a" ON "transactions_supporting_professionals_profiles" ("profilesId") `);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "agentId"`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "accessCode" character varying(6)`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "UQ_562dd1b907cbc2d1d53d7c24282" UNIQUE ("accessCode")`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "transactionCoordinatorAgentId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "realEstateAgentId" uuid`);
        await queryRunner.query(`ALTER TYPE "public"."profiles_profiletype_enum" RENAME TO "profiles_profiletype_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."profiles_profiletype_enum" AS ENUM('client', 'real_estate_agent', 'supporting_professional', 'transaction_coordinator_agent', 'broker')`);
        await queryRunner.query(`ALTER TABLE "profiles" ALTER COLUMN "profileType" TYPE "public"."profiles_profiletype_enum" USING "profileType"::"text"::"public"."profiles_profiletype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."profiles_profiletype_enum_old"`);
        await queryRunner.query(`ALTER TABLE "items" ALTER COLUMN "expectClosingDate" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "item_updates" ADD CONSTRAINT "FK_1aa6485a6e861bfcd7b3d18040d" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_8da83932543d251a7ffdb72636f" FOREIGN KEY ("transactionCoordinatorAgentId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_ce600e526e34844be61759af0fb" FOREIGN KEY ("realEstateAgentId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_605be897e18635c785596cbaa9c" FOREIGN KEY ("clientId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions_supporting_professionals_profiles" ADD CONSTRAINT "FK_b1a464ec4dbb0ba3350bfe07ab1" FOREIGN KEY ("transactionsTransactionId") REFERENCES "transactions"("transactionId") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactions_supporting_professionals_profiles" ADD CONSTRAINT "FK_a8d5b35a55edffb79c4192b95a2" FOREIGN KEY ("profilesId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions_supporting_professionals_profiles" DROP CONSTRAINT "FK_a8d5b35a55edffb79c4192b95a2"`);
        await queryRunner.query(`ALTER TABLE "transactions_supporting_professionals_profiles" DROP CONSTRAINT "FK_b1a464ec4dbb0ba3350bfe07ab1"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_605be897e18635c785596cbaa9c"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_ce600e526e34844be61759af0fb"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_8da83932543d251a7ffdb72636f"`);
        await queryRunner.query(`ALTER TABLE "item_updates" DROP CONSTRAINT "FK_1aa6485a6e861bfcd7b3d18040d"`);
        await queryRunner.query(`ALTER TABLE "items" ALTER COLUMN "expectClosingDate" SET DEFAULT ('now'::text)::date`);
        await queryRunner.query(`CREATE TYPE "public"."profiles_profiletype_enum_old" AS ENUM('client', 'real_estate_agent', 'supporting_professional', 'broker')`);
        await queryRunner.query(`ALTER TABLE "profiles" ALTER COLUMN "profileType" TYPE "public"."profiles_profiletype_enum_old" USING "profileType"::"text"::"public"."profiles_profiletype_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."profiles_profiletype_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."profiles_profiletype_enum_old" RENAME TO "profiles_profiletype_enum"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "realEstateAgentId"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "transactionCoordinatorAgentId"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "UQ_562dd1b907cbc2d1d53d7c24282"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "accessCode"`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "agentId" uuid NOT NULL`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a8d5b35a55edffb79c4192b95a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b1a464ec4dbb0ba3350bfe07ab"`);
        await queryRunner.query(`DROP TABLE "transactions_supporting_professionals_profiles"`);
        await queryRunner.query(`DROP TABLE "item_updates"`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_605be897e18635c785596cbaa9c" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_b7f013fd7dc39795d068db41293" FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
