import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../services/auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { User } from '../interfaces/user.interface';
import { ConfigService } from 'src/config.service';
import { UserService } from '../services/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy)
{
    constructor(private readonly userService: UserService, 
                private readonly config: ConfigService)
    {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.jwtSecret,
        });
    }

    async validate(payload: JwtPayload)/* : Promise<JwtPayload | null> */
    {
        const user = await this.userService.getUser(payload.email, false);

        if (!user || !user.isActive)
        {
            throw new UnauthorizedException("User was either not found or is not verified by email.");
        }

        return payload;
    }
}