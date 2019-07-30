/**-------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 *  Unit Test [Authentication Service]
 *
 *  Test Plan:
 *      - Auth Service should be defined    
 *
 *      - login()
 *          -[With correct credentials] returns email and jwtService.Sign is called with correct params
 *          -[With inactive user] throws UnauthorizedException
*           -[With incorrect password] throws UnauthorizedException
 *
 *      - sendVerificationEmail()
 *          -[With active user] returns "Email is already verified!" and getUser() was called with correct params
 *          -[With inactive user] returns "not_active@email.com was successfully verified!" and getUser() and getEmailVerificationToken() was called with correct params
 *          -[With inactive user with no verification token] returns "Email was NOT verified! Please re-register to resend the verification link." and getUser() was called with correct params
 * 
 *-------------------------------------------------------------------------------------------------------------------------------------------------------------------------**/
import { UserService } from "../services/user.service";
import { Test } from "@nestjs/testing";
import { AuthService } from "../services/auth.service";
import { JwtStrategy } from "../strategies/jwt.strategy";
import { EmailVerificationService } from "../services/email-verification.service";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { ConfigService } from "../../config.service";
import { userServiceMock } from "../mocks/user.mock";
import { emailVerificationServiceMock } from "../mocks/email-verification.mock";
import { configServiceMock } from "../../mocks/config.mock";
import { UnauthorizedException } from "@nestjs/common";
import { jwtServiceMock } from "../mocks/jwt-service.mock";

const secretKey: string = "secretKey";

describe('Auth Service', () =>
{
    let authService: AuthService;

    beforeAll(async () =>
    {
        let UserServiceProvider =
        {
            provide: UserService,
            useValue: userServiceMock
        };

        let EmailVerificationServiceProvider =
        {
            provide: EmailVerificationService,
            useValue: emailVerificationServiceMock
        };

        let ConfigServiceProvider =
        {
            provide: ConfigService,
            useValue: configServiceMock
        }

        let JwtServiceProvider =
        {
            provide: JwtService,
            useValue: jwtServiceMock
        }

        const module = await Test.createTestingModule({
            imports: [JwtModule.register({ secretOrPrivateKey: secretKey })],
            providers: [
                AuthService,
                JwtServiceProvider,
                UserServiceProvider,
                EmailVerificationServiceProvider,
                ConfigServiceProvider
            ]
        }).compile();

        authService = module.get<AuthService>(AuthService);
    });

    it('Auth Service should be defined', () =>
    {
        expect(authService).toBeTruthy();
    });

    describe('login()', () =>
    {
        it('[With correct credentials] returns email and jwtService.Sign is called with correct params', async () =>
        {
            // initialize test inputs and spies
            let email: string = "username@email.com";
            let password: string = "password123";
            let signSpy: jest.SpyInstance = jest.spyOn(jwtServiceMock, "sign");
            
            // run tests
            let testResults: string = await authService.login(email, password);
            expect(testResults).toBe(email);
            expect(signSpy).toBeCalledWith({ email, _userId: 69});
        });

        it('[With inactive user] throws UnauthorizedException', async () =>
        {
            // initialize test inputs and spies
            let email: string = "not_active@email.com";
            let password: string = "password123";

            // run tests
            let testResults: Promise<string> = authService.login(email, password);
            await expect(testResults).rejects.toThrow(UnauthorizedException);
        });

        it('[With incorrect password] throws UnauthorizedException', async () =>
        {
            // initialize test inputs and spies
            let email: string = "username@email.com";
            let password: string = "wrongpassword";

            // run tests
            let testResults: Promise<string> = authService.login(email, password);
            await expect(testResults).rejects.toThrow(UnauthorizedException)
        });
    });

    // verifyUser()
    describe('verifyUser()', () =>
    {
        it('[With active user] returns "Email is already verified!" and getUser() was called with correct params', async () =>
        {
            // initialize test inputs and spies
            let email: string = "username@email.com";
            let emailVerifyToken: string = "EmailVerifyToken";
            let getUserSpy: jest.SpyInstance = jest.spyOn(userServiceMock, "getUser");

            // run tests
            let testResults: string = await authService.verifyUser(email, emailVerifyToken);
            expect(testResults).toBe("Email is already verified!");
            expect(getUserSpy).toBeCalledWith(email);
        });

        it('[With inactive user] returns "not_active@email.com was successfully verified!" and getUser() and getEmailVerificationToken() was called with correct params', async () =>
        {
            // initialize test inputs and spies
            let email: string = "not_active@email.com";
            let emailVerifyToken: string = "EmailVerifyToken";
            let getUserSpy: jest.SpyInstance = jest.spyOn(userServiceMock, "getUser");
            let getEmailVerificationTokenSpy: jest.SpyInstance = jest.spyOn(emailVerificationServiceMock, "getEmailVerificationToken");

            // run tests
            let testResults: string = await authService.verifyUser(email, emailVerifyToken);
            expect(testResults).toBe("not_active@email.com was successfully verified!");
            expect(getUserSpy).toBeCalledWith(email);
            expect(getEmailVerificationTokenSpy).toBeCalledWith(userServiceMock.getUser(email)._id);
        });

        it('[With inactive user with no verification token] returns "Email was NOT verified! Please re-register to resend the verification link." and getUser() was called with correct params', async () =>
        {
            // initialize test inputs and spies
            let email: string = "no_token@email.com";
            let emailVerifyToken: string = "EmailVerifyToken";
            let getUserSpy: jest.SpyInstance = jest.spyOn(userServiceMock, "getUser");

            // run tests
            let testResults: string = await authService.verifyUser(email, emailVerifyToken);
            expect(testResults).toBe("Email was NOT verified! Please re-register to resend the verification link.");
            expect(getUserSpy).toBeCalledWith(email);
        });
    });
});