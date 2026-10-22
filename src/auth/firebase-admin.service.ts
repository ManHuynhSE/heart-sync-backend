import { Injectable, UnauthorizedException } from '@nestjs/common';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

@Injectable()
export class FirebaseAdminService {
  private readonly configured: boolean;

  constructor() {
    this.configured = Boolean(
      process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_CLIENT_EMAIL &&
        process.env.FIREBASE_PRIVATE_KEY,
    );

    if (this.configured && getApps().length === 0) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
  }

  async verifyIdToken(token: string) {
    if (!this.configured) {
      throw new UnauthorizedException(
        'Firebase Admin credentials are not configured',
      );
    }

    return getAuth().verifyIdToken(token);
  }
}
