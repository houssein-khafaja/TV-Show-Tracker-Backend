import { UserService } from "../services/user.service";
import { Test } from "@nestjs/testing";
import { AuthService } from "../services/auth.service";
import { JwtStrategy } from "../strategies/jwt.strategy";
import { EmailVerificationService } from "../services/email-verification.service";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { ConfigService } from "../../config.service";
import { userServiceMock } from "../mocks/user.mock";
import { emailVerificationServiceMock } from "../mocks/email-verification.mock";
import { configServiceMock } from "../mocks/config.mock";
import { UnauthorizedException } from "@nestjs/common";

const secretKey: string = "secretKey";

describe('Auth Service', () =>
{
    let authService: AuthService;

    beforeAll(async () =>
    {
        // init test module
        const module = await Test.createTestingModule({
            imports: [JwtModule.register({ secretOrPrivateKey: secretKey })],
            providers: [
                AuthService,
                JwtStrategy,
                {
                    provide: UserService,
                    useValue: userServiceMock
                },
                {
                    provide: EmailVerificationService,
                    useValue: emailVerificationServiceMock
                },
                {
                    provide: ConfigService,
                    useValue: configServiceMock
                }
            ]
        }).compile();

        authService = module.get<AuthService>(AuthService);
    });

    it('Auth Service should be defined', () =>
    {
        expect(authService).toBeTruthy();
    });

    // login()
    describe('login()', () =>
    {
        it('[With correct credentials] returns a signed jwt payload of length 105', async () =>
        {
            expect(await authService.login("username@email.com", "password123")).toHaveLength(144);
        });

        it('[With inactive user] throws UnauthorizedException', async () =>
        {
            await expect(authService.login("not_active@email.com", "password123")).rejects.toThrow(UnauthorizedException);
        });

        it('[With incorrect password] throws UnauthorizedException', async () =>
        {
            await expect(authService.login("username@email.com", "wrongpassword")).rejects.toThrow(UnauthorizedException);
        });
    });

    // verifyUser()
    describe('verifyUser()', () =>
    {
        it('[With active user] returns "Email is already verified!"', async () =>
        {
            expect(await authService.verifyUser("username@email.com", "EmailVerifyToken")).toBe("Email is already verified!");
        });

        it('[With inactive user] returns "not_active@email.com was successfully verified!"', async () =>
        {
            expect(await authService.verifyUser("not_active@email.com", "EmailVerifyToken")).toBe("not_active@email.com was successfully verified!");
        });

        it('[With inactive user with no verification token] returns "Email was NOT verified! Please re-register to resend the verification link."', async () =>
        {
            expect(await authService.verifyUser("no_token@email.com", "EmailVerifyToken")).toBe("Email was NOT verified! Please re-register to resend the verification link.");
        });
    });
});