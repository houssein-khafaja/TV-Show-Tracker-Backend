import { JwtService } from '@nestjs/jwt';
import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { User } from '../interfaces/user.interface';
import { compare } from 'bcrypt';

@Injectable()
export class AuthService
{
    constructor(private readonly usersService: UserService, private readonly jwtService: JwtService) { }

    async login(email: string, password: string): Promise<string | null>
    {
        // find user then compare password to hashed password
        let user: User = await this.usersService.getUser(email);

        // does user exist?
        if (user)
        {
            let isAuthorized: boolean = await compare(password, user.password);

            // if the user entered correct password AND is verified by email, then return a signed JWT
            // else thow exception
            if (isAuthorized && user.isActive)
            {
                return this.jwtService.sign({ email: user.email });
            }
            else
            {
                throw new UnauthorizedException();
            }
        }
        else
        {
            // user doesnt exist
            throw new NotFoundException();
        }
    }

    // Why is the payload weird? Its weird because it doesnt conform
    // to the class we set it to (JwtPayload) even when the type is not "any".
    // Online documentation is misleading and idk wtf to do here
    async authenticateUser(payload: JwtPayload): Promise<User | null>
    {
        // return result of user search by email
        return await this.usersService.getUser(payload.email);
    }
}