import { Controller, Post, Body, UseFilters, Get, Param, Render, Res, Query, UseGuards } from '@nestjs/common';
import { RegisterResponse, RegisterAndLoginRequest } from '../dto/register.dto';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { User } from '../interfaces/User.interface';
import { MongoExceptionFilter } from '../exception-filters/auth-exception.filter';
import { EmailVerificationToken } from '../interfaces/email-verification-token.interface';
import { AuthGuard } from '@nestjs/passport';
import { EmailVerificationService } from '../services/email-verification.service';

@Controller('auth')
@UseFilters(new MongoExceptionFilter())
export class AuthController
{
    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService,
        private readonly emailVerificationService: EmailVerificationService)
    { }

    // /auth/register
    @Post("register")
    async register(@Body() req: RegisterAndLoginRequest): Promise<{}>
    {
        return this.userService.registerUser(req.email, req.password);
    }

    // /auth/verify
    @Get("verify")
    @Render('email-verification')
    async verify(@Query('verification') verifyToken: string, @Query('email') email: string)
    {
        return await this.authService.verifyUser(email, verifyToken);
    }

    @Post("login")
    async login(@Body() req: RegisterAndLoginRequest): Promise<{}>
    {
        return await this.authService.login(req.email, req.password);
    }

    // check if jwt token is valid
    @Get("ping")
    @UseGuards(AuthGuard())
    async ping()
    {
        return "Success!"
    }
}
