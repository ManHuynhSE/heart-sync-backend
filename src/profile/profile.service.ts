import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateProfileDto } from './profile.dto.js';

type FirebaseUser = {
  uid: string;
  email?: string;
  name?: string;
};

type CompletionProfile = {
  name?: string | null;
  age?: number | null;
  occupation?: string | null;
  bio?: string | null;
  interests?: string[] | null;
  languages?: string[] | null;
  photoUrls?: string[] | null;
};

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateUser(firebaseUser: FirebaseUser) {
    return this.prisma.user.upsert({
      where: { firebaseUid: firebaseUser.uid },
      create: {
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.name,
      },
      update: {
        email: firebaseUser.email,
        displayName: firebaseUser.name,
      },
    });
  }

  async getMyProfile(firebaseUser: FirebaseUser) {
    const user = await this.getOrCreateUser(firebaseUser);
    return this.prisma.profile.findUnique({
      where: { userId: user.id },
    });
  }

  async updateMyProfile(firebaseUser: FirebaseUser, dto: UpdateProfileDto) {
    const user = await this.getOrCreateUser(firebaseUser);
    const current = await this.prisma.profile.findUnique({
      where: { userId: user.id },
    });
    const data = {
      ...dto,
      completion: this.calculateCompletion({ ...current, ...dto }),
    };

    return this.prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        name: dto.name ?? user.displayName ?? 'HeartSync member',
        age: dto.age,
        occupation: dto.occupation,
        bio: dto.bio,
        interests: dto.interests ?? [],
        languages: dto.languages ?? [],
        photoUrls: dto.photoUrls ?? [],
        completion: data.completion,
      },
      update: data,
    });
  }

  private calculateCompletion(profile: CompletionProfile | null) {
    if (!profile) return 0;
    const fields = [
      profile.name,
      profile.age,
      profile.occupation,
      profile.bio,
      profile.interests?.length,
      profile.languages?.length,
      profile.photoUrls?.length,
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }
}
