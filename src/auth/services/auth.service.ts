import { JwtService } from '@nestjs/jwt';
import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { User } from '../interfaces/user.interface';
import { compare } from 'bcrypt';

@Injectable()
export class AuthService
{
    constructor(private readonly usersService: UserService,
        private readonly jwtService: JwtService) { }

    async login(email: string, password: string): Promise<{}>
    {
        // find user then compare password to hashed password
        const user: User = await this.usersService.getUser(email);
        const isAuthorized: boolean = await compare(password, user.password);

        // if the user entered correct password AND is verified by email, then return a signed JWT
        // else thow exception
        if (isAuthorized && user.isActive)
        {
            const token: string = this.jwtService.sign({ email: user.email, _userId: user.id });

            return { statusCode: 201, token };
        }
        else
        {
            throw new UnauthorizedException("Username or password was incorrect, or the user has not been verified by email.");
        }
    }
}