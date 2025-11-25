import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

const ssl = process.env.DB_SSL === 'true';

// --- CONNECTION LOGIC (SOCKET VS TCP) ---
const instanceConnectionName = process.env.INSTANCE_CONNECTION_NAME;
const socketPath =
  process.env.DB_SOCKET_PATH ||
  (instanceConnectionName ? `/cloudsql/${instanceConnectionName}` : undefined);

// If socketPath exists, we assume we are in a Cloud Run/production environment
const isProduction = !!socketPath;

console.log('Calculated socketPath:', socketPath);
console.log('isProduction:', isProduction);

// --- DYNAMIC PATH LOGIC ---
// Detect if this file is running as .ts (ts-node/local) or .js (node/prod)
const isTsNode = __filename.endsWith('.ts');

// If TS, look in 'src' and '.ts' files. If JS, look in 'dist' and '.js' files
const rootDir = isTsNode ? 'src' : 'dist';
const fileExtension = isTsNode ? 'ts' : 'js';

export const AppDataSource = new DataSource({
  type: 'postgres',

  host: isProduction ? socketPath : process.env.DB_HOST,
  port: isProduction ? undefined : parseInt(process.env.DB_PORT || '5432'),

  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  schema: 'public',
  synchronize: false,
  logging: !isProduction, // Disable noisy logging in production
  // Use path.join to build the correct absolute path based on the environment

  entities: [
    path.join(__dirname, `../${rootDir}/**/*.entity.${fileExtension}`),
  ],
  migrations: [
    path.join(__dirname, `../${rootDir}/migrations/*.${fileExtension}`),
  ],

  subscribers: [], // No SSL on Cloud Run sockets, only SSL on remote TCP/IP or local

  ssl: !isProduction && ssl ? { rejectUnauthorized: false } : false,

  extra: {
    // socketPath is defined here, but only works if host/port are undefined
    ...(socketPath ? { socketPath } : {}),
    max: 10,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 10000,
  },
});
