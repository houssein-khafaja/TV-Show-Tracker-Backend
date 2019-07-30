/**--------------------------------------------------------------------------------------------------------------------------------------
 *  Unit Test [Email Verification Service]
 *
 *  Test Plan:
 *      - Email Verification Service should be defined    
 *
 *      - getEmailVerificationToken()
 *          -[With existing token] returns a token object
 *          -[With non existing token] returns null.
 *          -[With no token] returns null.
 *
 *      - sendVerificationEmail()
 *          -[With existing token] returns an array of length = 1, and emailVerificationService is called with the correct param.
 *          -[With nonexisting token] getEmailVerificationToken() and emailVerificationTokenModel() constructor are called with correct params.
 *       
 *      - doesEmailExist()
 *          -[With existing email] returns true
 *          -[With non-existing email] returns false
 *          -[With no email] returns false
 *--------------------------------------------------------------------------------------------------------------------------------------**/

import { Test } from "@nestjs/testing";
import { EmailVerificationService } from "../services/email-verification.service";
import { ConfigService } from "../../config.service";
import { emailVerificationServiceMock } from "../mocks/email-verification.mock";
import { configServiceMock } from "../../mocks/config.mock";
import { getModelToken } from "@nestjs/mongoose";
import nodemailer from 'nodemailer';
import { EmailVerificationToken } from "../interfaces/email-verification-token.interface";
import { json } from "body-parser";
jest.mock("nodemailer")

describe('Email Verification Service', () =>
{
    let emailVerificationService: EmailVerificationService;
    let emailVerificationTokenModel; // mongoose model

    beforeAll(async () =>
    {
        let ConfigServiceProvider =
        {
            // not sure why i have to define config service like this, but oh well
            provide: ConfigService,
            useValue: ConfigService
        };

        let EmailVerificationTokenProvider =
        {
            // provide a mocked version of our mongoose model
            provide: getModelToken("EmailVerificationToken"),
            useValue: (() =>
            {
                const verificationTokenModel: any = jest.fn();

                // mock the findOne().exec()
                verificationTokenModel.findOne = jest.fn().mockImplementation((filter: { _userId: number }) => ({
                    exec: jest.fn(() => emailVerificationServiceMock.getEmailVerificationToken(filter._userId)),
                }));

                // mock the constructor of the object
                verificationTokenModel.mockImplementation(() =>
                {
                    return {
                        save: jest.fn()
                    }
                });

                return verificationTokenModel;
            })(),
        }

        // init test module
        const module = await Test.createTestingModule({
            imports: [],
            providers: [
                EmailVerificationService,
                ConfigServiceProvider,
                EmailVerificationTokenProvider
            ]
        }).compile();

        // get the instances we want to test/spyOn
        emailVerificationTokenModel = module.get(getModelToken("EmailVerificationToken"));
        emailVerificationService = module.get<EmailVerificationService>(EmailVerificationService);

        // override nodemailer so it doesnt actually send an email
        (<jest.Mock>nodemailer.createTransport).mockReturnValue({ "sendMail": jest.fn() });

    });

    it('Email Verification Service should be defined', () =>
    {
        expect(emailVerificationService).toBeDefined();
    });

    describe('getEmailVerificationToken()', () =>
    {
        it('[With existing token] returns a token object. ', async () =>
        {
            // initialize test inputs and spies
            let _userId: number = 69;
            let findOneSpy: jest.SpyInstance = jest.spyOn(emailVerificationTokenModel, "findOne");

            // run tests
            let testResult: EmailVerificationToken = await emailVerificationService.getEmailVerificationToken(_userId);
            expect(testResult._userId).toBe(_userId);
            expect(findOneSpy).toBeCalledWith({ _userId });
        });

        it('[With non existing token] returns null. ', async () =>
        {
            // initialize test inputs and spies
            let _userId: number = 42;
            let findOneSpy: jest.SpyInstance = jest.spyOn(emailVerificationTokenModel, "findOne");

            // run tests
            let testResult: EmailVerificationToken = await emailVerificationService.getEmailVerificationToken(_userId);
            expect(testResult).toBeNull();
            expect(findOneSpy).toBeCalledWith({ _userId });
        });

        it('[With no token] returns null.', async () =>
        {
            // initialize test inputs and spies
            let _userId: number = undefined;
            let findOneSpy: jest.SpyInstance = jest.spyOn(emailVerificationTokenModel, "findOne");

            // run tests
            let testResult: EmailVerificationToken = await emailVerificationService.getEmailVerificationToken(_userId);
            expect(testResult).toBeNull();
            expect(findOneSpy).toBeCalledWith({ _userId });
        });
    });

    // this one is hard to test since it involves sending emails so instead we will 
    // just spy on certain function calls and make sure they're being called correctly
    describe('sendVerificationEmail()', () =>
    {
        it('[With existing token] returns an array of length = 1, and emailVerificationService is called with the correct param.', async () =>
        {
            // initialize test inputs and spies
            let email: string = "houssein.dev@gmail.com";
            let _userId: number = 69;
            let getEmailVerificationTokenSpy: jest.SpyInstance = jest.spyOn(emailVerificationService, 'getEmailVerificationToken');

            // run tests
            await emailVerificationService.sendVerificationEmail(email, _userId);
            expect(getEmailVerificationTokenSpy).toHaveBeenCalledWith(_userId);
        });

        it('[With nonexisting token] getEmailVerificationToken() and emailVerificationTokenModel() constructor are called with correct params.', async () =>
        {
            // initialize test inputs and spies
            let email: string = "houssein.dev@gmail.com";
            let _userId: number = 123; // token doesnt exist
            let getEmailVerificationTokenSpy: jest.SpyInstance = jest.spyOn(emailVerificationService, 'getEmailVerificationToken');

            // run tests
            await emailVerificationService.sendVerificationEmail(email, _userId)
            expect(getEmailVerificationTokenSpy).toHaveBeenCalledWith(_userId);
            expect(emailVerificationTokenModel).toHaveBeenCalledWith({ _userId, token: expect.any(String) });
        });
    });

    describe('doesEmailExist()', () =>
    {
        it('[With existing email] returns true', async () =>
        {
            // initialize test inputs and spies
            let email: string = "houssein.dev@gmail.com";

            // run tests
            let testResults: boolean = await emailVerificationService.doesEmailExist(email);
            expect(testResults).toBeTruthy();
        });


        it('[With non-existing email] returns false', async () =>
        {
            // initialize test inputs and spies
            let email: string = "I-hope-this-email-does-not-exist-13c0afb98db@gmail.com";

            // run tests
            let testResults: boolean = await emailVerificationService.doesEmailExist(email);
            expect(testResults).toBeFalsy();
        });

        it('[With no email] returns false', async () =>
        {
            // initialize test inputs and spies
            let email;

            // run tests
            let testResults: boolean = await emailVerificationService.doesEmailExist(email);
            expect(testResults).toBeFalsy();
        });
    });
});