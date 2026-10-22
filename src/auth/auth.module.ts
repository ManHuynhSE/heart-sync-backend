import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { FirebaseAdminService } from './firebase-admin.service.js';

@Module({
  controllers: [AuthController],
  providers: [FirebaseAdminService],
  exports: [FirebaseAdminService],
})
export class AuthModule {}
