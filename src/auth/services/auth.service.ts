import { JwtService } from '@nestjs/jwt';
import { Injectable, UnauthorizedException, NotFoundException, NotAcceptableException, InternalServerErrorException } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { User } from '../interfaces/user.interface';
import { compare } from 'bcrypt';
import { EmailVerificationToken } from '../interfaces/email-verification-token.interface';
import { EmailVerificationService } from './email-verification.service';

@Injectable()
export class AuthService
{
    constructor(
        private readonly usersService: UserService,
        private readonly jwtService: JwtService,
        private readonly emailVerificationService: EmailVerificationService)
    { }

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

    async verifyUser(email: string, verifyToken: string)
    {
        // find user
        const user: User = await this.usersService.getUser(email);

        if (user.isActive)
        {
            // already verified
            throw new NotAcceptableException("Email is already verified!");
        }
        else
        {
            // not verified, lets try to verify it then!
            // does user have a verification token active?
            const tokenFound: EmailVerificationToken = await this.emailVerificationService.getEmailVerificationToken(user._id);

            if (tokenFound && tokenFound.token == verifyToken)
            {
                // tokens match, time to verify!
                user.isActive = true;
                const result: User = await user.save();

                if (result)
                {
                    return { statusCode: 201, message: "Email was successfully verified!" }

                }
                else
                {
                    throw new InternalServerErrorException("Email was NOT successfully verified!")
                }
            }
            else
            {
                // tokens didnt match or no token was found
                throw new NotFoundException("Email was NOT verified! Please re-register to resend the verification link.");
            }

        }
    }
}