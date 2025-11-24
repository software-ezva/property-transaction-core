import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

const ssl = process.env.DB_SSL === 'true';

// --- LÓGICA DE CONEXIÓN (SOCKET VS TCP) ---
const instanceConnectionName = process.env.INSTANCE_CONNECTION_NAME;
const socketPath =
  process.env.DB_SOCKET_PATH ||
  (instanceConnectionName ? `/cloudsql/${instanceConnectionName}` : undefined);

const isProduction = !!socketPath;

// --- LÓGICA DE RUTAS DINÁMICAS (CRUCIAL PARA MIGRACIONES) ---
// Detectamos si este archivo se está ejecutando como .ts (ts-node/local) o .js (node/prod)
const isTsNode = __filename.endsWith('.ts');

// Si es TS, buscamos en 'src' y archivos '.ts'. Si es JS, buscamos en 'dist' y archivos '.js'
const rootDir = isTsNode ? 'src' : 'dist';
const fileExtension = isTsNode ? 'ts' : 'js';

export const AppDataSource = new DataSource({
  type: 'postgres',

  host: isProduction ? undefined : process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),

  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  schema: 'public',
  synchronize: false,
  logging: !isProduction,

  // Usamos path.join para construir la ruta absoluta correcta según el entorno
  entities: [
    path.join(__dirname, `../${rootDir}/**/*.entity.${fileExtension}`),
  ],
  migrations: [
    path.join(__dirname, `../${rootDir}/migrations/*.${fileExtension}`),
  ],

  subscribers: [],

  ssl: !isProduction && ssl ? { rejectUnauthorized: false } : false,

  extra: {
    ...(socketPath ? { socketPath } : {}),
    max: 10,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 10000,
  },
});
