import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { passportSecert } from 'config';
import { User } from '../interfaces/user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService)
    {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: passportSecert,
        });
    }

    async validate(payload: JwtPayload)/* : Promise<JwtPayload | null> */
    {
        const user = await this.authService.authenticateUser(payload);
        console.log(user);
        
        if (!user || !user.isActive)
        {
            throw new UnauthorizedException();
        }

        return payload; 
    }
}