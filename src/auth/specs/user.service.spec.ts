/**-----------------------------------------------------------------------------------------------------------------------------------------------------
 *  Unit Test [User Service]
 *
 *  Test Plan:
 *      - User Service should be defined    
 *
 *      - registerUser()
 *          -[With non existing user & available email] calls doesEmailExist(), getUser() and sendVerificationEmail() with correct params.
 *          -[With non existing & unavailable email] throws NotFoundException and doesEmailExist() is called with correct params.
 *          -[With existing & inactive user,  and available email] calls doesEmailExist(), getUser() and sendVerificationEmail() with correct params.
 *          -[With existing & active user, and available email] throws UnprocessableEntityException and doesEmailExist() is called with correct params.
 * 
 *      - getUser()
 *          -[With user that exists]] returns a user with correct email and findOne() was called with correct params
 *          -[With user that does NOT exist] throws NotFoundException and findOne() was called with correct params
 *          -[With user that does NOT exist AND throwException = false] returns undefined and findOne() was called with correct params
 * 
 *------------------------------------------------------------------------------------------------------------------------------------------------------**/
import { UserService } from "../services/user.service";
import { Test } from "@nestjs/testing";
import { EmailVerificationService } from "../services/email-verification.service";
import { userServiceMock } from "../mocks/user.mock";
import { emailVerificationServiceMock } from "../mocks/email-verification.mock";
import { NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { SentMessageInfo } from "nodemailer";
import { User } from "../interfaces/user.interface";

describe('User Service', () =>
{
    let userService: UserService;
    let userModel;

    beforeAll(async () =>
    {
        let EmailVerificationServiceProvider =
        {
            provide: EmailVerificationService,
            useValue: emailVerificationServiceMock
        };

        let UserModelProvider =
        {
            provide: getModelToken("User"),
            useValue: (() =>
            {
                const mongooseUserModel: any = jest.fn();
                mongooseUserModel.findOne = jest.fn().mockImplementation((filter: { email: string }) => ({
                    exec: jest.fn(() => userServiceMock.getUser(filter.email)),
                }));

                mongooseUserModel.mockImplementation((credentials: { email: string, password: string }) =>
                {
                    return {
                        save: () => ({ email: credentials.email, _id: 0 })
                    }
                });

                return mongooseUserModel;
            })(),
        }

        // init test module
        const module = await Test.createTestingModule({
            imports: [],
            providers: [
                UserService,
                EmailVerificationServiceProvider,
                UserModelProvider

            ]
        }).compile();

        userModel = module.get(getModelToken("User"));
        userService = module.get<UserService>(UserService);

    });

    it('User Service should be defined', () =>
    {
        expect(userService).toBeTruthy();
    });

    // registerUser()
    describe('registerUser()', () =>
    {
        it('[With non existing user & available email] calls doesEmailExist(), getUser() and sendVerificationEmail()  correct params.', async () =>
        {
            // initialize test inputs and spies
            let email: string = "not_registered@email.com";
            let password: string = "password123";
            let doesEmailExistSpy: jest.SpyInstance = jest.spyOn(emailVerificationServiceMock, "doesEmailExist");
            let getUserSpy: jest.SpyInstance = jest.spyOn(userServiceMock, "getUser");
            let sendVerificationEmailSpy: jest.SpyInstance = jest.spyOn(emailVerificationServiceMock, "sendVerificationEmail");

            // run tests
            let results: SentMessageInfo = await userService.registerUser(email, password);
            expect(doesEmailExistSpy).toBeCalledWith(email);
            expect(getUserSpy).toBeCalledWith(email);
            expect(sendVerificationEmailSpy).toBeCalledWith(email, 0);
        });

        it('[With non existing & unavailable email] throws NotFoundException and doesEmailExist() is called with correct params. ', async () =>
        {
            // initialize test inputs and spies
            let email: string = "non-existent-user@email.com";
            let password: string = "password123";
            let doesEmailExistSpy: jest.SpyInstance = jest.spyOn(emailVerificationServiceMock, "doesEmailExist");

            // run tests
            let results: Promise<SentMessageInfo> = userService.registerUser(email, password);
            expect(results).rejects.toThrow(NotFoundException);
            expect(doesEmailExistSpy).toBeCalledWith(email);
        });

        it('[With existing & inactive user,  and available email] calls doesEmailExist(), getUser() and sendVerificationEmail()  correct params.', async () =>
        {
            // initialize test inputs and spies
            let email: string = "not_active@email.com";
            let password: string = "password123";
            let doesEmailExistSpy: jest.SpyInstance = jest.spyOn(emailVerificationServiceMock, "doesEmailExist");
            let getUserSpy: jest.SpyInstance = jest.spyOn(userServiceMock, "getUser");
            let sendVerificationEmailSpy: jest.SpyInstance = jest.spyOn(emailVerificationServiceMock, "sendVerificationEmail");

            // run tests
            let results: SentMessageInfo = await userService.registerUser(email, password);
            expect(doesEmailExistSpy).toBeCalledWith(email);
            expect(getUserSpy).toBeCalledWith(email);
            expect(sendVerificationEmailSpy).toBeCalledWith(email, userServiceMock.getUser(email)._id);
        });

        it('[With existing & active user, and available email] throws UnprocessableEntityException and doesEmailExist() is called with correct params.', async () =>
        {
            // initialize test inputs and spies
            let email: string = "username@email.com";
            let password: string = "password123";
            let doesEmailExistSpy: jest.SpyInstance = jest.spyOn(emailVerificationServiceMock, "doesEmailExist");

            // run tests
            let results: Promise<SentMessageInfo> = userService.registerUser(email, password);
            expect(results).rejects.toThrow(UnprocessableEntityException);
            expect(doesEmailExistSpy).toBeCalledWith(email);
        });
    });

    // getUser()
    describe('getUser()', () =>
    {
        it('[With user that exists]] returns a user with correct email and findOne() was called with correct params', async () =>
        {
            // initialize test inputs and spies
            let email: string = "username@email.com";
            let findOneSpy: jest.SpyInstance = jest.spyOn(userModel, "findOne");

            // run tests
            let results: User = await userService.getUser(email);
            expect(results.email).toBe(email);
            expect(findOneSpy).toBeCalledWith({ email });
        });

        it('[With user that does NOT exist] throws NotFoundException and findOne() was called with correct params' , async () =>
        {
            // initialize test inputs and spies
            let email: string = "not_registered@email.com";
            let findOneSpy: jest.SpyInstance = jest.spyOn(userModel, "findOne");

            // run tests
            let results: Promise<User> = userService.getUser(email);
            expect(results).rejects.toThrow(NotFoundException);
            expect(findOneSpy).toBeCalledWith({ email });
        });

        it('[With user that does NOT exist AND throwException = false] returns undefined and findOne() was called with correct params', async () =>
        {
            // initialize test inputs and spies
            let email: string = "not_registered@email.com";
            let findOneSpy: jest.SpyInstance = jest.spyOn(userModel, "findOne");

            // run tests
            let results: User = await userService.getUser(email, false);
            expect(results).toBeUndefined();
            expect(findOneSpy).toBeCalledWith({ email });
        });
    });
});