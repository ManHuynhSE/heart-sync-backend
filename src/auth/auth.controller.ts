import {
  Body,
  Controller,
  Headers,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseAdminService } from './firebase-admin.service.js';

class FirebaseTokenDto {
  idToken!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly firebase: FirebaseAdminService) {}

  @Post('firebase')
  async verifyFirebaseToken(@Body() body: FirebaseTokenDto) {
    if (!body.idToken?.trim()) {
      throw new UnauthorizedException('idToken is required');
    }

    const decoded = await this.firebase.verifyIdToken(body.idToken);
    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      name: decoded.name ?? null,
    };
  }

  @Post('session')
  async inspectSession(@Headers('authorization') authorization?: string) {
    const token = authorization?.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException('Bearer token is required');
    }

    const decoded = await this.firebase.verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email ?? null };
  }
}
