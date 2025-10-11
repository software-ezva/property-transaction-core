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
      const requiredVars = [
        'FIREBASE_PROJECT_ID',
        'FIREBASE_CLIENT_EMAIL',
        'FIREBASE_PRIVATE_KEY',
        'FIREBASE_STORAGE_BUCKET',
      ];

      const missingVars = requiredVars.filter(
        (varName) => !process.env[varName],
      );

      if (missingVars.length > 0) {
        this.logger.warn(
          `Firebase configuration incomplete. Missing variables: ${missingVars.join(', ')}`,
        );
        return;
      }

      if (!admin.apps.length) {
        let privateKey = process.env.FIREBASE_PRIVATE_KEY!;

        privateKey = privateKey.replace(/\\n/g, '\n');

        if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
          privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----\n`;
        }

        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID!,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
            privateKey: privateKey,
          }),
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET!,
        });
      }

      this.bucket = admin.storage();
      this.isConfigured = true;
      this.logger.log('Firebase initialized successfully');
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
