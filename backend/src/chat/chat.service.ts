import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createRoom(userId: string, dto: CreateRoomDto) {
    const room = await this.prisma.room.create({
      data: {
        name: dto.name,
        members: {
          create: { userId },
        },
      },
    });
    return room;
  }

  async getRooms() {
    return this.prisma.room.findMany({
      include: { _count: { select: { members: true } } },
    });
  }

  async joinRoom(userId: string, roomId: string) {
    const room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Room not found');

    const existing = await this.prisma.roomMember.findUnique({
      where: { userId_roomId: { userId, roomId } },
    });
    if (existing) return { message: 'Already joined' };

    return this.prisma.roomMember.create({
      data: { userId, roomId },
    });
  }

  async leaveRoom(userId: string, roomId: string) {
    const member = await this.prisma.roomMember.findUnique({
      where: { userId_roomId: { userId, roomId } },
    });
    if (!member) throw new NotFoundException('Not a member');

    await this.prisma.roomMember.delete({
      where: { userId_roomId: { userId, roomId } },
    });
    return { message: 'Left room' };
  }

  async getMessages(userId: string, roomId: string) {
    const member = await this.prisma.roomMember.findUnique({
      where: { userId_roomId: { userId, roomId } },
    });
    if (!member) throw new ForbiddenException('Not a member of this room');

    return this.prisma.message.findMany({
      where: { roomId },
      include: { user: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async sendMessage(userId: string, dto: SendMessageDto) {
    const member = await this.prisma.roomMember.findUnique({
      where: { userId_roomId: { userId, roomId: dto.roomId } },
    });
    if (!member) throw new ForbiddenException('Not a member of this room');

    return this.prisma.message.create({
      data: {
        content: dto.content,
        userId,
        roomId: dto.roomId,
      },
      include: { user: { select: { id: true, username: true } } },
    });
  }
}