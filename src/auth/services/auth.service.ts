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

    async login(email: string, password: string): Promise<string>
    {
        // find user then compare password to hashed password
        const user: User = await this.usersService.getUser(email);
        const isAuthorized: boolean = await compare(password, user.password);

        // if the user entered correct password AND is verified by email, then return a signed JWT
        // else thow exception
        if (isAuthorized && user.isActive)
        {
            return this.jwtService.sign({ email: user.email, _userId: user.id });
        }
        else
        {
            throw new UnauthorizedException("Username or password was incorrect, or the user has not been verified by email.");
        }
    }

    async verifyUser(email: string, verifyToken: string): Promise<string>
    {
        // find user
        const user: User = await this.usersService.getUser(email);

        // is user verified?
        if (user.isActive)
        {
            return "Email is already verified!";
        }
        // not verified, lets try to verify it then!
        else
        {
            // search for a verification token
            const tokenFound: EmailVerificationToken = await this.emailVerificationService.getEmailVerificationToken(user._id);

            if (tokenFound && tokenFound.token == verifyToken)
            {
                // tokens match, time to verify!
                user.isActive = true;
                let verifiedUser: User =  await user.save();
                return `${verifiedUser.email} was successfully verified!`;
            }
            else
            {
                // tokens didnt match or no token was found
                return "Email was NOT verified! Please re-register to resend the verification link.";
            }
        }
    }
}