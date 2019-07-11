import { Controller, Post, Body, UseFilters, Get, Param, Render, Res, Query, UseGuards } from '@nestjs/common';
import { RegisterResponse, RegisterAndLoginRequest } from './dto/register.dto';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';
import { User } from './interfaces/User.interface';
import { MongoExceptionFilter } from './exception-filters/auth-exception.filter';
import { EmailVerificationToken } from './interfaces/email-verification-token.interface';
import { AuthGuard } from '@nestjs/passport';
import { EmailVerificationService } from './services/email-verification.service';

@Controller('auth')
@UseFilters(new MongoExceptionFilter())
export class AuthController
{
    constructor(private readonly userService: UserService, 
                private readonly authService: AuthService,
                private readonly emailVerificationService: EmailVerificationService) { }

    // /auth/register
    @Post("register")
    async register(@Body() req: RegisterAndLoginRequest): Promise<RegisterResponse>
    {
        return this.userService.registerUser(req.email, req.password);
    }

    // /auth/verify
    @Get("verify")
    @Render('email-verification')
    async verify(@Query('verification') verifyToken: string, @Query('email') email: string)
    {
        // find user
        let user: User = await this.userService.getUser(email);

        if (user)
        {
            if (user.isActive)
            {
                // already verified
                return { message: "Email is already verified!" }
            }
            else
            {
                // not verified, lets try to verify it then!
                // does user have a verification token active?
                let tokenFound: EmailVerificationToken = await this.emailVerificationService.getEmailVerificationToken(user._id);

                if (tokenFound && tokenFound.token == verifyToken)
                {
                    // tokens match, time to verify!
                    user.isActive = true;
                    await user.save();
                    return { message: "Email was successfully verified!" }
                }
                else
                {
                    // tokens didnt match or no token was found
                    return { message: "Email was NOT verified! Please re-register to resend the verification link." }
                }

            }
        }
        else
        {
            // user was not found
            return { message: "Email was not found!" }
        }
    }

    @Post("login")
    async login(@Body() req: RegisterAndLoginRequest): Promise<{}>
    {
        const token: string = await this.authService.login(req.email, req.password);
        return { token };
    }

    // check if jwt token is valid
    @Post("ping")
    @UseGuards(AuthGuard())
    async ping()
    {
        return "Success!"
    }
}
