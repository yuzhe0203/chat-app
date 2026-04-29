import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { SendMessageDto } from './dto/send-message.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('rooms')
  createRoom(@Request() req, @Body() dto: CreateRoomDto) {
    return this.chatService.createRoom(req.user.id, dto);
  }

  @Get('rooms')
  getRooms() {
    return this.chatService.getRooms();
  }

  @Post('rooms/:roomId/join')
  joinRoom(@Request() req, @Param('roomId') roomId: string) {
    return this.chatService.joinRoom(req.user.id, roomId);
  }

  @Delete('rooms/:roomId/leave')
  leaveRoom(@Request() req, @Param('roomId') roomId: string) {
    return this.chatService.leaveRoom(req.user.id, roomId);
  }

  @Get('rooms/:roomId/messages')
  getMessages(@Request() req, @Param('roomId') roomId: string) {
    return this.chatService.getMessages(req.user.id, roomId);
  }

  @Post('messages')
  sendMessage(@Request() req, @Body() dto: SendMessageDto) {
    return this.chatService.sendMessage(req.user.id, dto);
  }
}