import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { DecodedJwt } from '../interfaces/decodedJwt.interface';
import { TvdbJwtService } from '../../tvshow/services/tvdb-jwt.service';


@Injectable()
export class AuthenticationMiddleware implements NestMiddleware
{
    constructor(
        private readonly jwtService: JwtService,
        private readonly tvdbJwtService: TvdbJwtService)
    { }

    // extracts jwt token from auth header, decodes it, then adds it to 
    // the incoming request body before it gets to a route handler
    use(req: Request, res: Response, next: Function)
    {
        if (req.headers.authorization)
        {
            // remove "Bearer " from the string and then decode jwt into an object
            const jwt: string = req.headers.authorization.slice(7);
            req.body.decodedJwt = (this.jwtService.decode(jwt) as DecodedJwt)
        }

        // The TVDB jwt token only lasts for 24 hours, so we will referesh it whenever someone sends a request to the server
        // However, this means we will lose a token after 24 hours of inactivity and will need to restart the server.
        // Since the user's will be regularly syncing their local DBs with the server's, this should never happen
        // if the server has at least 1 active user
        this.tvdbJwtService.refreshTvdbJwtToken();
        next();
    }
}