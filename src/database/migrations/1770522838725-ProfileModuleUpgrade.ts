import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProfileModuleUpgrade1770522838725 implements MigrationInterface {
  name = 'ProfileModuleUpgrade1770522838725';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."profile_skills_category_enum" AS ENUM('professional', 'technical', 'interpersonal', 'domain', 'language', 'tool')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."profile_skills_level_enum" AS ENUM('strong', 'used_before', 'learning')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."profile_skills_source_enum" AS ENUM('user', 'cv_parse', 'ai_suggest')`,
    );
    await queryRunner.query(
      `CREATE TABLE "profile_skills" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "profileId" uuid NOT NULL, "name" character varying(255) NOT NULL, "category" "public"."profile_skills_category_enum" NOT NULL DEFAULT 'professional', "level" "public"."profile_skills_level_enum" NOT NULL DEFAULT 'used_before', "contexts" jsonb NOT NULL DEFAULT '[]', "evidence" jsonb NOT NULL DEFAULT '[]', "source" "public"."profile_skills_source_enum" NOT NULL DEFAULT 'user', "confidence" numeric(3,2) NOT NULL DEFAULT '1', "lastUsedYear" integer, "possibleDuplicate" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9347b76dd1aff0f0285dbba7f79" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_06997053aae60bc838f5b6d156" ON "profile_skills" ("profileId", "name") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."profile_experiences_employmenttype_enum" AS ENUM('full_time', 'part_time', 'freelance', 'internship')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."profile_experiences_scope_enum" AS ENUM('individual', 'team', 'multi_team', 'organization')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."profile_experiences_source_enum" AS ENUM('user', 'cv_parse', 'ai_suggest')`,
    );
    await queryRunner.query(
      `CREATE TABLE "profile_experiences" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "profileId" uuid NOT NULL, "organization" character varying(255) NOT NULL, "role" character varying(255) NOT NULL, "employmentType" "public"."profile_experiences_employmenttype_enum" NOT NULL DEFAULT 'full_time', "startDate" date, "endDate" date, "responsibilities" jsonb NOT NULL DEFAULT '[]', "scope" "public"."profile_experiences_scope_enum" NOT NULL DEFAULT 'individual', "skillsUsed" uuid array NOT NULL DEFAULT '{}', "source" "public"."profile_experiences_source_enum" NOT NULL DEFAULT 'user', "confidence" numeric(3,2) NOT NULL DEFAULT '1', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1f9ad5b6b19ae8daf2152222c6a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_db8c13535be8dfee2c93b068ff" ON "profile_experiences" ("profileId", "organization") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."profile_projects_context_enum" AS ENUM('academic', 'personal', 'freelance', 'internal', 'volunteer')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."profile_projects_source_enum" AS ENUM('user', 'cv_parse', 'ai_suggest')`,
    );
    await queryRunner.query(
      `CREATE TABLE "profile_projects" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "profileId" uuid NOT NULL, "name" character varying(255) NOT NULL, "context" "public"."profile_projects_context_enum" NOT NULL DEFAULT 'personal', "description" text, "role" character varying(255), "skillsUsed" uuid array NOT NULL DEFAULT '{}', "outcomes" jsonb NOT NULL DEFAULT '[]', "source" "public"."profile_projects_source_enum" NOT NULL DEFAULT 'user', "confidence" numeric(3,2) NOT NULL DEFAULT '1', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d3149ffc17c374c007ccc7fafba" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_27b0e1fbdc01ae8df9f81d1c1e" ON "profile_projects" ("profileId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."career_intents_desiredseniority_enum" AS ENUM('entry', 'junior', 'mid', 'senior', 'lead', 'manager')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."career_intents_source_enum" AS ENUM('user', 'cv_parse', 'ai_suggest')`,
    );
    await queryRunner.query(
      `CREATE TABLE "career_intents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "profileId" uuid NOT NULL, "applyNowRoles" jsonb NOT NULL DEFAULT '[]', "targetRoles" jsonb NOT NULL DEFAULT '[]', "desiredSeniority" "public"."career_intents_desiredseniority_enum", "salaryExpectation" jsonb, "companyPreferences" jsonb NOT NULL DEFAULT '[]', "industries" jsonb NOT NULL DEFAULT '[]', "avoid" jsonb NOT NULL DEFAULT '{"roles":[],"industries":[],"skills":[]}', "source" "public"."career_intents_source_enum" NOT NULL DEFAULT 'user', "confidence" numeric(3,2) NOT NULL DEFAULT '1', "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_bc09a1acfb5b12e03805a7c3b62" UNIQUE ("profileId"), CONSTRAINT "REL_bc09a1acfb5b12e03805a7c3b6" UNIQUE ("profileId"), CONSTRAINT "PK_e7bc94eb0af647000801e23e663" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_bc09a1acfb5b12e03805a7c3b6" ON "career_intents" ("profileId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."work_preferences_workmode_enum" AS ENUM('remote', 'onsite', 'hybrid', 'flexible')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."work_preferences_workinghours_enum" AS ENUM('fixed', 'flexible', 'shift')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."work_preferences_source_enum" AS ENUM('user', 'cv_parse', 'ai_suggest')`,
    );
    await queryRunner.query(
      `CREATE TABLE "work_preferences" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "profileId" uuid NOT NULL, "locations" jsonb NOT NULL DEFAULT '[]', "workMode" "public"."work_preferences_workmode_enum" NOT NULL DEFAULT 'flexible', "workingHours" "public"."work_preferences_workinghours_enum" NOT NULL DEFAULT 'flexible', "languages" jsonb NOT NULL DEFAULT '[]', "dealBreakers" jsonb NOT NULL DEFAULT '[]', "source" "public"."work_preferences_source_enum" NOT NULL DEFAULT 'user', "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c25e775c160fe7c1f15cf232337" UNIQUE ("profileId"), CONSTRAINT "REL_c25e775c160fe7c1f15cf23233" UNIQUE ("profileId"), CONSTRAINT "PK_3d7cc5c6bb36b70e73fa7141687" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_c25e775c160fe7c1f15cf23233" ON "work_preferences" ("profileId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."cv_import_sessions_status_enum" AS ENUM('parsed', 'confirmed', 'discarded')`,
    );
    await queryRunner.query(
      `CREATE TABLE "cv_import_sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "profileId" uuid NOT NULL, "rawText" text NOT NULL, "parsedFields" jsonb NOT NULL DEFAULT '{"skills":[],"experiences":[],"projects":[]}', "lowConfidenceFields" jsonb NOT NULL DEFAULT '[]', "status" "public"."cv_import_sessions_status_enum" NOT NULL DEFAULT 'parsed', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "confirmedAt" TIMESTAMP, CONSTRAINT "PK_abccb4e048913aceb768beb7fac" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f824be9b9b1d27c154206e77bf" ON "cv_import_sessions" ("profileId", "status") `,
    );
    await queryRunner.query(
      `CREATE TABLE "profile_metadata" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "profileId" uuid NOT NULL, "usedFor" jsonb NOT NULL DEFAULT '{"cvGenerated":0,"jobMatched":0,"mockInterview":0}', "lastAiAnalysis" TIMESTAMP, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_7617d375f04ccc2bfe068a7b735" UNIQUE ("profileId"), CONSTRAINT "REL_7617d375f04ccc2bfe068a7b73" UNIQUE ("profileId"), CONSTRAINT "PK_b76e33935f0a1fe05e98bad3be7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_7617d375f04ccc2bfe068a7b73" ON "profile_metadata" ("profileId") `,
    );
    await queryRunner.query(`ALTER TABLE "profiles" ADD "currentRole" character varying`);
    await queryRunner.query(
      `CREATE TYPE "public"."profiles_senioritylevel_enum" AS ENUM('entry', 'junior', 'mid', 'senior', 'lead', 'manager')`,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" ADD "seniorityLevel" "public"."profiles_senioritylevel_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "profiles" ADD "yearsOfExperience" integer`);
    await queryRunner.query(`ALTER TABLE "profiles" ADD "location" character varying`);
    await queryRunner.query(
      `CREATE TYPE "public"."profiles_workpreference_enum" AS ENUM('remote', 'onsite', 'hybrid', 'flexible')`,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" ADD "workPreference" "public"."profiles_workpreference_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."profiles_source_enum" AS ENUM('user', 'cv_parse', 'ai_suggest')`,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" ADD "source" "public"."profiles_source_enum" NOT NULL DEFAULT 'user'`,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" ADD "confidence" numeric(3,2) NOT NULL DEFAULT '1'`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_skills" ADD CONSTRAINT "FK_67b2de30757887ace9e06c7796e" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_experiences" ADD CONSTRAINT "FK_748cbfc317f4e84d1bf6557c21b" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_projects" ADD CONSTRAINT "FK_27b0e1fbdc01ae8df9f81d1c1ea" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "career_intents" ADD CONSTRAINT "FK_bc09a1acfb5b12e03805a7c3b62" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_preferences" ADD CONSTRAINT "FK_c25e775c160fe7c1f15cf232337" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cv_import_sessions" ADD CONSTRAINT "FK_7f8bc0248dbbe79164dbc2892ec" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_metadata" ADD CONSTRAINT "FK_7617d375f04ccc2bfe068a7b735" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "profile_metadata" DROP CONSTRAINT "FK_7617d375f04ccc2bfe068a7b735"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cv_import_sessions" DROP CONSTRAINT "FK_7f8bc0248dbbe79164dbc2892ec"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_preferences" DROP CONSTRAINT "FK_c25e775c160fe7c1f15cf232337"`,
    );
    await queryRunner.query(
      `ALTER TABLE "career_intents" DROP CONSTRAINT "FK_bc09a1acfb5b12e03805a7c3b62"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_projects" DROP CONSTRAINT "FK_27b0e1fbdc01ae8df9f81d1c1ea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_experiences" DROP CONSTRAINT "FK_748cbfc317f4e84d1bf6557c21b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_skills" DROP CONSTRAINT "FK_67b2de30757887ace9e06c7796e"`,
    );
    await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "confidence"`);
    await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "source"`);
    await queryRunner.query(`DROP TYPE "public"."profiles_source_enum"`);
    await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "workPreference"`);
    await queryRunner.query(`DROP TYPE "public"."profiles_workpreference_enum"`);
    await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "location"`);
    await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "yearsOfExperience"`);
    await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "seniorityLevel"`);
    await queryRunner.query(`DROP TYPE "public"."profiles_senioritylevel_enum"`);
    await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "currentRole"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_7617d375f04ccc2bfe068a7b73"`);
    await queryRunner.query(`DROP TABLE "profile_metadata"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f824be9b9b1d27c154206e77bf"`);
    await queryRunner.query(`DROP TABLE "cv_import_sessions"`);
    await queryRunner.query(`DROP TYPE "public"."cv_import_sessions_status_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_c25e775c160fe7c1f15cf23233"`);
    await queryRunner.query(`DROP TABLE "work_preferences"`);
    await queryRunner.query(`DROP TYPE "public"."work_preferences_source_enum"`);
    await queryRunner.query(`DROP TYPE "public"."work_preferences_workinghours_enum"`);
    await queryRunner.query(`DROP TYPE "public"."work_preferences_workmode_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_bc09a1acfb5b12e03805a7c3b6"`);
    await queryRunner.query(`DROP TABLE "career_intents"`);
    await queryRunner.query(`DROP TYPE "public"."career_intents_source_enum"`);
    await queryRunner.query(`DROP TYPE "public"."career_intents_desiredseniority_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_27b0e1fbdc01ae8df9f81d1c1e"`);
    await queryRunner.query(`DROP TABLE "profile_projects"`);
    await queryRunner.query(`DROP TYPE "public"."profile_projects_source_enum"`);
    await queryRunner.query(`DROP TYPE "public"."profile_projects_context_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_db8c13535be8dfee2c93b068ff"`);
    await queryRunner.query(`DROP TABLE "profile_experiences"`);
    await queryRunner.query(`DROP TYPE "public"."profile_experiences_source_enum"`);
    await queryRunner.query(`DROP TYPE "public"."profile_experiences_scope_enum"`);
    await queryRunner.query(`DROP TYPE "public"."profile_experiences_employmenttype_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_06997053aae60bc838f5b6d156"`);
    await queryRunner.query(`DROP TABLE "profile_skills"`);
    await queryRunner.query(`DROP TYPE "public"."profile_skills_source_enum"`);
    await queryRunner.query(`DROP TYPE "public"."profile_skills_level_enum"`);
    await queryRunner.query(`DROP TYPE "public"."profile_skills_category_enum"`);
  }
}
