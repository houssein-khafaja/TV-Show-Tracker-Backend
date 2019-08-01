import { JwtService } from '@nestjs/jwt';
import { Injectable, UnauthorizedException, NotFoundException, NotAcceptableException, InternalServerErrorException } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { User } from '../interfaces/user.interface';
import { compare } from 'bcrypt';
import { EmailVerificationToken } from '../interfaces/email-verification-token.interface';
import { EmailVerificationService } from './email-verification.service';

/**---------------------------------------------------------------------------------------------------------------
 * This Service handles user logins and email verifications.
 * Each method will be responsible for throwing exceptions when appropriate.
 * ---------------------------------------------------------------------------------------------------------------*/
@Injectable()
export class AuthService
{
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly emailVerificationService: EmailVerificationService)
    { }

    /**
     * After finding the user via email, this method will brcypt.compare the provided
     * password to the stored password. If the passwords match, then a signed JWt token 
     * is returned.
     * @param email user email
     * @param password user password
     * @throws UnauthorizedException if passwords do not match, if the user was not found, or if the user is not verified
     * @returns a signed JWT token
     */
    async login(email: string, password: string): Promise<string>
    {
        // find user then compare password to hashed password
        const user: User = await this.userService.getUser(email);
        const isAuthorized: boolean = await compare(password, user.password);

        // if the user entered correct password AND is verified by email, then return a signed JWT
        // else thow exception
        if (isAuthorized && user && user.isActive)
        {
            return this.jwtService.sign({ email: user.email, _userId: user._id });
        }
        else
        {
            throw new UnauthorizedException("Username or password was incorrect, or the user has not been verified by email.");
        }
    }

    /**
     * Once a user is found, the provided verification token is compared with the
     * stored token in our database. Then the appropriate message is returned, which 
     * is assumed  to be used inside of an HTML view.
     * @param email user email
     * @param verifyToken email verification token
     * @returns a message depending on the status of the verification request
     */
    async verifyUserByEmail(email: string, verifyToken: string): Promise<string>
    {
        // find user
        const user: User = await this.userService.getUser(email);

        if (!user)
        {
            return "User was not found!";
        }

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
                let verifiedUser: User = await user.save();
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