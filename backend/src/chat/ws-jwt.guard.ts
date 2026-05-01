import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Socket } from "socket.io";
import { UsersService } from "../users/users.service";

@Injectable()
export class WsJwtGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private usersService: UsersService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client: Socket = context.switchToWs().getClient();
        const token = 
            client.handshake.auth?.token || 
            client.handshake.headers?.authorization?.split(' ')[1];
        
        if (!token) throw new UnauthorizedException();
        
        try {
            const payload = this.jwtService.verify(token, {
                secret: process.env.JWT_ACCESS_SECRET ?? 'fallback_secret',
            });
            const user = await this.usersService.findById(payload.sub);
            if(!user) throw new UnauthorizedException();
            (client as any).user = user;
            return true;
        } catch {
            throw new UnauthorizedException();
        }
    }
}