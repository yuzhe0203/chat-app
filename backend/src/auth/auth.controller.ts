import { Controller, Post, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    async register(@Body() body: { email: string, username: string, password: string },) {
        return this.authService.register(body.email, body.username, body.password);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() body: { email: string, password: string },) {
        return this.authService.login(body.email, body.password);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('jwt-refresh'))
    async refresh(@Req() req: Request) {
        const user = req.user as { id: string; email: string };
        return this.authService.refresh(user.id, user.email);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('jwt'))
    async logout(@Req() req: Request) {
        const user = req.user as { id: string };
        return this.authService.logout(user.id);
    }
}
