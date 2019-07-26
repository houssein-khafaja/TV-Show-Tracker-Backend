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
import { UnauthorizedException, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { User } from "../interfaces/user.interface";

describe('User Service', () =>
{
    let userService: UserService;
    let userModel;

    beforeAll(async () =>
    {
        // init test module
        const module = await Test.createTestingModule({
            imports: [],
            providers: [
                UserService,
                {
                    provide: EmailVerificationService,
                    useValue: emailVerificationServiceMock
                },
                {
                    provide: getModelToken("User"),
                    useValue: (() =>
                    {
                        const mongooseUserModel: any = jest.fn();
                        mongooseUserModel.findOne = jest.fn().mockImplementation((filter: { email: string }) => ({
                            exec: jest.fn(() => userServiceMock.getUser(filter.email)),
                        }));

                        return mongooseUserModel;
                    })(),
                },

            ]
        }).compile();

        userModel = module.get(getModelToken("User"));
        userService = module.get<UserService>(UserService);

        userModel.mockImplementation((credentials: { email: string, password: string }) =>
        {
            return {
                save: () => ({ email: credentials.email, _id: 0 })
            }
        });

    });

    it('Auth Service should be defined', () =>
    {
        expect(userService).toBeTruthy();
    });

    // registerUser()
    describe('registerUser()', () =>
    {
        it('[With non existing user & available email] returns true. ', async () =>
        {
            // truthy means email got through to sendVerificationEmail() and returned true
            expect(await userService.registerUser("not_registered@email.com", "password123")).toBeTruthy();
        });

        it('[With non existing & unavailable email] throws NotFoundException. ', async () =>
        {
            await expect(userService.registerUser("non-existent-user@email.com", "password123")).rejects.toThrow(NotFoundException);
        });

        it('[With existing & inactive user,  and available email] returns true', async () =>
        {
            // truthy means email got through to sendVerificationEmail() and returned true
            expect(await userService.registerUser("not_active@email.com", "password123")).toBeTruthy();
        });

        it('[With existing & active user, and available email] throws UnprocessableEntityException', async () =>
        {
            await expect(userService.registerUser("username@email.com", "password123")).rejects.toThrow(UnprocessableEntityException);
        });
    });

    // getUser()
    describe('getUser()', () =>
    {
        it('[With user that exists]] returns a user object with email as property', async () =>
        {
            expect((await userService.getUser("username@email.com")).email).toBe("username@email.com");
        });

        it('[With user that does NOT exist] throws UnprocessableEntityException', async () =>
        {
            await expect(userService.getUser("not_registered@email.com")).rejects.toThrow(NotFoundException);
        });

        it('[With user that does NOT exist AND throwException = false] returns undefined', async () =>
        {
            expect(await userService.getUser("not_registered@email.com", false)).toBeUndefined();
        });
    });
    // verifyUser()
    // describe('verifyUser()', () =>
    // {
    //     it('[With active user] returns "Email is already verified!"', async () =>
    //     {
    //         expect(await authService.verifyUser("username@email.com", "EmailVerifyToken")).toBe("Email is already verified!");
    //     });

    //     it('[With inactive user] returns "not_active@email.com was successfully verified!"', async () =>
    //     {
    //         expect(await authService.verifyUser("not_active@email.com", "EmailVerifyToken")).toBe("not_active@email.com was successfully verified!");
    //     });

    //     it('[With inactive user with no verification token] returns "Email was NOT verified! Please re-register to resend the verification link."', async () =>
    //     {
    //         expect(await authService.verifyUser("no_token@email.com", "EmailVerifyToken")).toBe("Email was NOT verified! Please re-register to resend the verification link.");
    //     });
    // });
});