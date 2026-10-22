import {
  Body,
  Controller,
  Get,
  Headers,
  Put,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseAdminService } from '../auth/firebase-admin.service.js';
import { UpdateProfileDto } from './profile.dto.js';
import { ProfileService } from './profile.service.js';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly firebase: FirebaseAdminService,
    private readonly profiles: ProfileService,
  ) {}

  @Get('me')
  async getMyProfile(@Headers('authorization') authorization?: string) {
    return this.profiles.getMyProfile(
      await this.getFirebaseUser(authorization),
    );
  }

  @Put('me')
  async updateMyProfile(
    @Headers('authorization') authorization: string | undefined,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profiles.updateMyProfile(
      await this.getFirebaseUser(authorization),
      dto,
    );
  }

  private async getFirebaseUser(authorization?: string) {
    const token = authorization?.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException('Bearer token is required');
    }
    return this.firebase.verifyIdToken(token);
  }
}
