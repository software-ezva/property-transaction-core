import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);
  private bucket: admin.storage.Storage | null = null;
  private isConfigured = false;

  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      if (!admin.apps.length) {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;
        const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

        if (!storageBucket) {
          this.logger.warn(
            'Firebase configuration incomplete. Missing FIREBASE_STORAGE_BUCKET',
          );
          return;
        }

        // Si tenemos credenciales explícitas (JSON/Env vars), las usamos (Modo Local/Legacy)
        if (clientEmail && privateKey && projectId) {
          let formattedKey = privateKey.replace(/\\n/g, '\n');
          if (!formattedKey.includes('-----BEGIN PRIVATE KEY-----')) {
            formattedKey = `-----BEGIN PRIVATE KEY-----\n${formattedKey}\n-----END PRIVATE KEY-----\n`;
          }

          admin.initializeApp({
            credential: admin.credential.cert({
              projectId,
              clientEmail,
              privateKey: formattedKey,
            }),
            storageBucket,
          });
          this.logger.log(
            'Firebase initialized with explicit credentials (JSON/Env)',
          );
        } else {
          // Si no, usamos Application Default Credentials (ADC) (Modo Cloud/GCP)
          // Esto requiere que el entorno tenga acceso (ej. Cloud Run Service Account)
          admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            storageBucket,
            projectId, // Opcional, pero recomendado si está disponible
          });
          this.logger.log(
            'Firebase initialized with Application Default Credentials (ADC)',
          );
        }
      }

      this.bucket = admin.storage();
      this.isConfigured = true;
    } catch (error) {
      this.logger.error('Failed to initialize Firebase', error);
      this.isConfigured = false;
    }
  }

  isFirebaseConfigured(): boolean {
    return this.isConfigured;
  }

  getBucket() {
    if (!this.isConfigured || !this.bucket) {
      throw new Error('Firebase not configured. Check environment variables.');
    }
    return this.bucket.bucket();
  }

  // Método seguro que devuelve null si no está configurado
  getSafeBucket() {
    if (!this.isConfigured || !this.bucket) {
      return null;
    }
    return this.bucket.bucket();
  }
}
