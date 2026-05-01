import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async register(email: string, username: string, password: string) {
        const existedEmail = await this.usersService.findByEmail(email);
        if (existedEmail) throw new ConflictException('Email is already existed');

        const existedUsername = await this.usersService.findByUsername(username);
        if (existedUsername) throw new ConflictException('Username is already existed');

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await this.usersService.create({ email, username, passwordHash });

        const tokens = await this.generateTokens(user.id, user.email);
        await this.saveRefreshToken(user.id, tokens.refreshToken);
        return tokens;
    }

    async login(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) throw new UnauthorizedException('Invalid credentials');
        
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) throw new UnauthorizedException('Invalid credentials');

        const tokens = await this.generateTokens(user.id, user.email);
        await this.saveRefreshToken(user.id, tokens.refreshToken);
        return tokens;
    }

    async refresh(userId: string, email: string) {
        const tokens = await this.generateTokens(userId, email);
        await this.saveRefreshToken(userId, tokens.refreshToken);
        return tokens;
    }

    async logout(userId: string) {
        await this.usersService.updateRefreshToken(userId, null);
    }

    private async generateTokens(userId: string, email: string) {
        const payload = { sub: userId, email };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: process.env.JWT_ACCESS_SECRET ?? 'fallback_secret',
                expiresIn: (process.env.JWT_EXPIRY ?? '15m') as any,
            }),
            this.jwtService.signAsync(payload, {
                secret: process.env.JWT_REFRESH_SECRET ?? 'fallback_refresh_secret',
                expiresIn: (process.env.REFRESH_TOKEN_EXPIRY ?? '7d') as any,
            }),
        ]);

        return { accessToken, refreshToken };
    }

    private async saveRefreshToken(userId: string, refreshToken: string) {
        const hash = await bcrypt.hash(refreshToken, 10);
        await this.usersService.updateRefreshToken(userId, hash);
    }
}
