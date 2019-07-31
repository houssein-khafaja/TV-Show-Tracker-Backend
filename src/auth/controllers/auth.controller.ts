import { Controller, Post, Body, UseFilters, Get, Param, Render, Res, Query, UseGuards, ServiceUnavailableException } from '@nestjs/common';
import { RegisterAndLoginRequest, VerifyRequest } from '../dto/register.dto';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { User } from '../interfaces/User.interface';
import { MongoExceptionFilter } from '../exception-filters/auth-exception.filter';
import { EmailVerificationToken } from '../interfaces/email-verification-token.interface';
import { AuthGuard } from '@nestjs/passport';
import { EmailVerificationService } from '../services/email-verification.service';
import { ReturnPayload } from 'src/interfaces/general';
import { SentMessageInfo } from 'nodemailer';

@Controller('auth')
@UseFilters(new MongoExceptionFilter())
export class AuthController
{
    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService)
    { }

    // /auth/register
    @Post("register")
    async register(@Body() req: RegisterAndLoginRequest): Promise<ReturnPayload>
    {
        let sentEmailInfo: SentMessageInfo = await this.userService.registerUser(req.email, req.password);

        if (sentEmailInfo.accepted.length > 0)
        {
            return { statusCode: 201, message: `Verification email was sent to: ${sentEmailInfo.envelope.to[0]}`};
        }
        else
        {
            throw new ServiceUnavailableException("Verification email was not accepted by the end destination (user's email address).")
        }
    }

    // /auth/verify
    @Get("verify")
    @Render('email-verification')
    async verify(@Query() req: VerifyRequest): Promise<ReturnPayload>
    {
        let verificationMessage: string = await this.authService.verifyUser(req.email, req.verification);
        return { statusCode: 201, message: verificationMessage }
    }

    @Post("login")
    async login(@Body() req: RegisterAndLoginRequest): Promise<ReturnPayload>
    {
        let jwtToken: string = await this.authService.login(req.email, req.password);
        return { statusCode: 201, message: `Login Success!`, data: { jwtToken } }
    }

    // check if jwt token is valid
    @Get("ping")
    @UseGuards(AuthGuard())
    async ping(): Promise<ReturnPayload>
    {
        return { statusCode: 200, message: `Token Valid!` }
    }
}
