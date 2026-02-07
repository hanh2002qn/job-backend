import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedPlans1770482284562 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create table 'plans' first if not exists (though TypeORM sync might handle schema, migration is safer for data)
    // Assuming table structure is created by synchronization or another migration.
    // We will insert data here.

    await queryRunner.query(`
      INSERT INTO "plans" ("slug", "name", "description", "price", "currency", "interval", "limits", "isActive")
      VALUES
        ('free', 'Free Plan', 'Basic features for job seekers', 0, 'USD', NULL, '{"max_cvs": 2, "monthly_credits": 0, "ai_access": false, "cv_templates": ["free"]}', true),
        ('premium_monthly', 'Premium Monthly', 'Unlock full potential with monthly subscription', 9.99, 'USD', 'month', '{"max_cvs": 9999, "monthly_credits": 200, "ai_access": true, "cv_templates": ["free", "premium"]}', true),
        ('premium_yearly', 'Premium Yearly', 'Best value for long-term career growth', 99.99, 'USD', 'year', '{"max_cvs": 9999, "monthly_credits": 200, "ai_access": true, "cv_templates": ["free", "premium"]}', true);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "plans" WHERE "slug" IN ('free', 'premium_monthly', 'premium_yearly')`,
    );
  }
}
