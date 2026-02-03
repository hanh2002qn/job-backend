/* eslint-disable no-console */
import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../data-source';

const runSeed = async () => {
  const dataSource = new DataSource(dataSourceOptions);

  try {
    await dataSource.initialize();
    console.log('Data Source has been initialized!');
    console.log('Starting seeding...');

    // Example: Run User Seeder
    // await new UserSeeder().run(dataSource);
    // You can add your seeders here

    console.log('Seeding finished successfully.');
  } catch (err) {
    console.error('Error during seeding:', err);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
};

void runSeed();
