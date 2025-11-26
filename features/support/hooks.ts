import { BeforeAll, Before, AfterAll } from '@cucumber/cucumber';
import { DataSource } from 'typeorm';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables FIRST
const isTestMode = process.env.NODE_ENV === 'test';
const envFile = isTestMode ? '.env.test' : '.env';
const envPath = path.resolve(__dirname, `../../${envFile}`);
console.log(`📁 Loading environment from: ${envPath}`);
const envResult = dotenv.config({ path: envPath });

if (envResult.error) {
  console.warn(
    '⚠️ Warning: Could not load .env file:',
    envResult.error.message,
  );
} else {
  console.log('✅ Environment variables loaded');
}

// Database configuration
const baseConfig = {
  type: 'postgres' as const,
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '6753'),
  username: process.env.DB_USERNAME || 'develop',
  password: process.env.DB_PASSWORD || 'qwerty12',
  entities: [path.join(__dirname, '../../src/**/*.entity{.ts,.js}')],
  synchronize: true,
  logging: false,
};

let dataSource: DataSource;

// Before all tests
BeforeAll(async function () {
  console.log('🚀 Setting up test environment...');

  try {
    const testDatabase = process.env.DB_DATABASE || 'property_transaction_test';
    console.log(`🔧 Connecting to test database: ${testDatabase}`);

    // Connect directly to the test database
    dataSource = new DataSource({
      ...baseConfig,
      database: testDatabase,
      dropSchema: true,
    });

    await dataSource.initialize();
    console.log('✅ Test database connection established');

    // Run synchronization to create/update tables
    await dataSource.synchronize();
    console.log('✅ Database schema synchronized');
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Failed to set up test database:', errorMessage);
    console.log(
      '💡 Make sure the test database exists and you have permissions',
    );
    console.log(
      `💡 You can create it with: CREATE DATABASE ${process.env.DB_DATABASE || 'property_transaction_test'};`,
    );
    throw error;
  }
});

// Before each scenario
Before(async function () {
  if (!dataSource || !dataSource.isInitialized) {
    console.warn('⚠️ Database not initialized, skipping cleanup');
    return;
  }

  try {
    // Get all entity metadata
    const entities = dataSource.entityMetadatas;

    if (entities.length === 0) {
      console.log('ℹ️ No entities found, skipping table cleanup');
      return;
    }

    // Clear all tables
    for (const entity of entities) {
      try {
        await dataSource.query(
          `TRUNCATE TABLE "${entity.tableName}" RESTART IDENTITY CASCADE`,
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.warn(
          `⚠️ Failed to truncate ${entity.tableName}:`,
          errorMessage,
        );
      }
    }

    console.log('🧹 Test data cleared');
  } catch (error) {
    console.error('❌ Failed to clear test data:', error);
  }
});

// After all tests
AfterAll(async function () {
  console.log('🧹 Cleaning up test environment...');

  try {
    // Close test database connection
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('✅ Database connection closed');
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Failed to clean up database:', errorMessage);
  }
});

// Export for use in step definitions
export const getDataSource = () => dataSource;
