import {
  Controller,
  Get,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('live')
  live() {
    return { status: 'ok', service: 'heart-sync-backend' };
  }

  @Get('ready')
  async ready() {
    if (!process.env.DATABASE_URL) {
      throw new ServiceUnavailableException({
        status: 'not_ready',
        reason: 'DATABASE_URL is not configured',
      });
    }

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ready', database: 'reachable' };
    } catch {
      throw new ServiceUnavailableException({
        status: 'not_ready',
        reason: 'Database is unreachable',
      });
    }
  }
}
