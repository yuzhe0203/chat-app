import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ChatGateway } from './chat.gateway';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { WsJwtGuard } from './ws-jwt.guard';

@Module({
  imports: [PrismaModule, UsersModule, JwtModule.register({})],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, WsJwtGuard],
})
export class ChatModule {}