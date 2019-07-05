import { Controller, Post, Body, UseFilters, Get, Param, Render, Res, Query } from '@nestjs/common';
import { RegisterResponse, RegisterRequest } from './dto/register.dto';
import { UserService } from './user.service';
import { User } from './interfaces/User.interface';
import { MongoExceptionFilter } from './exception-filters/auth-exception.filter';
import { EmailVerificationToken } from './interfaces/email-verification-token.interface';

@Controller('auth')
@UseFilters(new MongoExceptionFilter())
export class AuthController
{
    constructor(private readonly userService: UserService) { }

    // /auth/register
    @Post("register")
    async register(@Body() req: RegisterRequest): Promise<RegisterResponse>
    {
        return this.userService.registerUser(req.email, req.password);
    }

    // /auth/verify
    @Get("verify")
    @Render('email-verification')
    async root(@Query('verification') verifyToken: string, @Query('email') email: string)
    {
        console.log(email);
        
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
                let tokenFound: EmailVerificationToken = await this.userService.getToken(user._id);

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
}
