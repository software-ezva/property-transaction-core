import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

// --- DEBUG LOGS START ---
console.log('--- DataSource Configuration Debug ---');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_SOCKET_PATH (raw):', process.env.DB_SOCKET_PATH);
console.log('INSTANCE_CONNECTION_NAME:', process.env.INSTANCE_CONNECTION_NAME);
console.log('DB_HOST:', process.env.DB_HOST);
// --- DEBUG LOGS END ---

const ssl = process.env.DB_SSL === 'true';

// --- LÓGICA DE CONEXIÓN (SOCKET VS TCP) ---
const instanceConnectionName = process.env.INSTANCE_CONNECTION_NAME;
const socketPath =
  process.env.DB_SOCKET_PATH ||
  (instanceConnectionName ? `/cloudsql/${instanceConnectionName}` : undefined);

// Si socketPath existe, asumimos que estamos en un entorno de Cloud Run/producción
const isProduction = !!socketPath;

console.log('Calculated socketPath:', socketPath);
console.log('isProduction:', isProduction);

// --- LÓGICA DE RUTAS DINÁMICAS (CRUCIAL PARA MIGRACIONES) ---
// Detectamos si este archivo se está ejecutando como .ts (ts-node/local) o .js (node/prod)
const isTsNode = __filename.endsWith('.ts');

// Si es TS, buscamos en 'src' y archivos '.ts'. Si es JS, buscamos en 'dist' y archivos '.js'
const rootDir = isTsNode ? 'src' : 'dist';
const fileExtension = isTsNode ? 'ts' : 'js';

export const AppDataSource = new DataSource({
  type: 'postgres',

  // CORRECCIÓN: En Postgres, para usar sockets, 'host' debe ser la ruta del directorio del socket.
  // Si se deja undefined, pg conecta a localhost por defecto.
  host: isProduction ? socketPath : process.env.DB_HOST,
  port: isProduction ? undefined : parseInt(process.env.DB_PORT || '5432'),

  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  schema: 'public',
  synchronize: false,
  logging: !isProduction, // Desactivar el logging ruidoso en producción
  // Usamos path.join para construir la ruta absoluta correcta según el entorno

  entities: [
    path.join(__dirname, `../${rootDir}/**/*.entity.${fileExtension}`),
  ],
  migrations: [
    path.join(__dirname, `../${rootDir}/migrations/*.${fileExtension}`),
  ],

  subscribers: [], // No SSL en sockets de Cloud Run, solo SSL en TCP/IP remoto o local

  ssl: !isProduction && ssl ? { rejectUnauthorized: false } : false,

  extra: {
    // Aquí se define el socketPath, pero solo funciona si host/port son undefined
    ...(socketPath ? { socketPath } : {}),
    max: 10,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 10000,
  },
});
