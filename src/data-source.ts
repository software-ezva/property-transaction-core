import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const ssl = process.env.DB_SSL === 'true';
const socketPath = process.env.DB_SOCKET_PATH;

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: socketPath || process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  schema: 'public',
  synchronize: false,
  logging: true,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
  ssl: ssl ? { rejectUnauthorized: false } : false,
  extra: {
    ...(socketPath ? { socketPath } : {}),
  },
});
