import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { DecodedJwt } from '../interfaces/decodedJwt.interface';

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware
{
    constructor(private readonly jwtService: JwtService) { }

    use(req: Request, res: Response, next: Function)
    {

        if (req.headers.authorization)
        {
            // remove "Bearer " from the string and then decode jwt into an object
            let jwt: string = req.headers.authorization.slice(7);
            req.body.decodedJwt = (this.jwtService.decode(jwt) as DecodedJwt)

        }
        next();
    }
}