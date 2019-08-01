import { Controller, Post, Body, UseFilters, Get, Render, Query, UseGuards } from '@nestjs/common';
import { RegisterAndLoginRequest, VerifyRequest } from '../dto/register.dto';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { MongoExceptionFilter } from '../exception-filters/auth-exception.filter';
import { AuthGuard } from '@nestjs/passport';
import { ReturnPayload } from 'src/interfaces/general';

/**---------------------------------------------------------------------------------------------------------------
 *  Authentication Controller
 *
 * The purpose of this controller is to handle the routes related to Authentication of users.
 * Each route handler is pretty simple. They will call the respective functions from a service,
 * then return the results as data. The route handler assumes that error checking and validation 
 * is handled by the injected services and class-validated classes, such as RegisterAndLoginRequest.
 *---------------------------------------------------------------------------------------------------------------*/
@Controller('auth')
@UseFilters(new MongoExceptionFilter())
export class AuthController
{
    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService)
    { }

    /**
     * Will call registerUser() to create a new inactive account and send a verification
     * email to the user. registerUser will return the email address that received the email.
     * @param req the body of the request from the client
     */
    @Post("register")
    async register(@Body() req: RegisterAndLoginRequest): Promise<ReturnPayload>
    {
        let sentTo: string = await this.userService.registerUser(req.email, req.password);
        return { statusCode: 201, message: `Verification email was sent to: ${sentTo}` };
    }

    /**
     * Will call verifyUser() to verify the user of the given email with the given token. If verified,
     * the user will be marked "active" and a simple HTML page will be sent back to the user with the 
     * success message. Will return other messages if the user is not verified.
     * @param req the body of the request from the client
     */
    @Get("verify")
    @Render('email-verification') // return the html page in ./views and inject the object returned by this function
    async verify(@Query() req: VerifyRequest): Promise<ReturnPayload>
    {
        let verificationMessage: string = await this.authService.verifyUserByEmail(req.email, req.verification);
        return { statusCode: 201, message: verificationMessage }
    }

    /**
     * Will call login() to authenticate user credentials. If the email and password combination are correct,
     * then a JWT token is returned to the client.
     * @param req the body of the request from the client
     */
    @Post("login")
    async login(@Body() req: RegisterAndLoginRequest): Promise<ReturnPayload>
    {
        let jwtToken: string = await this.authService.login(req.email, req.password);
        return { statusCode: 201, message: `Login Success!`, data: { jwtToken } }
    }

    /**
     * The purpose of this route is to allow clients to check if their JWt tokens are still valid.
     */
    @Get("ping")
    @UseGuards(AuthGuard())
    async ping(): Promise<ReturnPayload>
    {
        return { statusCode: 200, message: `Token Valid!` }
    }
}
