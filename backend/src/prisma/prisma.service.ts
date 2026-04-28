import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as PrismaRuntime from '../../generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
    private client: PrismaRuntime.PrismaClient;

   constructor() {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    this.client = new PrismaRuntime.PrismaClient({ adapter });
  }

    get user() { return this.client.user };
    get room() { return this.client.room };
    get roomMember() { return this.client.roomMember};
    get message() { return this.client.message };

    async onModuleInit() {
        await this.client.$connect();
    }

    async onModuleDestroy() {
        await this.client.$disconnect();
    }
}
