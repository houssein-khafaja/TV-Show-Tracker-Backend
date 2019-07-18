import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { Test } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../schemas/user.schema';
import { EmailVerificationTokenSchema } from '../schemas/email-verification-token.schema';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '../../config.module';
import { ConfigService } from '../../config.service';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { EmailVerificationService } from '../services/email-verification.service';
import { RegisterAndLoginRequest } from '../dto/register.dto';
import Imap from 'imap'
import util from 'util'

describe('AuthController', () =>
{
    let authController: AuthController;
    let authService: AuthService;
    let userService: UserService;

    beforeEach(async () =>
    {
        // init test module
        const module = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [AuthService, JwtStrategy, EmailVerificationService, UserService],
            imports: [
                MongooseModule.forRoot('mongodb://localhost/passport', { useNewUrlParser: true }),
                MongooseModule.forFeature([{ name: 'User', schema: UserSchema }, { name: "EmailVerificationToken", schema: EmailVerificationTokenSchema }]),
                PassportModule.register({ defaultStrategy: 'jwt' }),
                JwtModule.registerAsync({
                    imports: [ConfigModule],
                    useFactory: async (configService: ConfigService) => ({
                        secret: configService.jwtSecret,
                    }),
                    inject: [ConfigService],
                }),
            ]
        }).compile();

        authService = module.get<AuthService>(AuthService);
        userService = module.get<UserService>(UserService);
        authController = module.get<AuthController>(AuthController);
    });

    /************************************ 
        REGISTRATION UNIT TESTS
    ************************************/
    describe('/register', () =>
    {
        // it('Test with no inputs.', async () =>
        // {
        //     let expected =
        //     {
        //         "statusCode": 400,
        //         "error": "Bad Request",
        //         "message": [
        //             {
        //                 "target": {},
        //                 "property": "email",
        //                 "children": [],
        //                 "constraints": {
        //                     "isEmail": "Invalid Email"
        //                 }
        //             },
        //             {
        //                 "target": {},
        //                 "property": "password",
        //                 "children": [],
        //                 "constraints": {
        //                     "minLength": "Invalid Password"
        //                 }
        //             }
        //         ]
        //     };

        //     jest.spyOn(userService, 'registerUser').mockImplementation(() => Promise.resolve(expected));
        //     expect(await authController.register({ email: undefined, password: undefined })).toEqual(expected);
        // });

        // it('Test with no email but with password.', async () =>
        // {
        //     let expected =
        //     {
        //         "statusCode": 400,
        //         "error": "Bad Request",
        //         "message": [
        //             {
        //                 "target": {
        //                     "password": "password"
        //                 },
        //                 "property": "email",
        //                 "children": [],
        //                 "constraints": {
        //                     "isEmail": "Invalid Email"
        //                 }
        //             }
        //         ]
        //     };

        //     await jest.spyOn(userService, 'registerUser').mockImplementation(() => Promise.resolve(expected));
        //     expect(await authController.register({ email: undefined, password: "password" })).toEqual(expected);
        // });

        // it('Test with empty string email but with password.', async () =>
        // {
        //     let expected =
        //     {
        //         "statusCode": 400,
        //         "error": "Bad Request",
        //         "message": [
        //             {
        //                 "target": {
        //                     "email": "",
        //                     "password": "password"
        //                 },
        //                 "value": "",
        //                 "property": "email",
        //                 "children": [],
        //                 "constraints": {
        //                     "isEmail": "Invalid Email"
        //                 }
        //             }
        //         ]
        //     };

        //     await jest.spyOn(userService, 'registerUser').mockImplementation(() => Promise.resolve(expected));
        //     expect(await authController.register({ email: "", password: "password" })).toEqual(expected);
        // });

        // it('Test invalid email (simple string) and valid password.', async () =>
        // {
        //     let expected =
        //     {
        //         "statusCode": 400,
        //         "error": "Bad Request",
        //         "message": [
        //             {
        //                 "target": {
        //                     "email": "houssein",
        //                     "password": "password"
        //                 },
        //                 "value": "houssein",
        //                 "property": "email",
        //                 "children": [],
        //                 "constraints": {
        //                     "isEmail": "Invalid Email"
        //                 }
        //             }
        //         ]
        //     };

        //     await jest.spyOn(userService, 'registerUser').mockImplementation(() => Promise.resolve(expected));
        //     expect(await authController.register({ email: "houssein", password: "password" })).toEqual(expected);
        // });

        // it('Test invalid email (simpel string + @) and valid password.', async () =>
        // {
        //     let expected =
        //     {
        //         "statusCode": 400,
        //         "error": "Bad Request",
        //         "message": [
        //             {
        //                 "target": {
        //                     "email": "houssein@",
        //                     "password": "password"
        //                 },
        //                 "value": "houssein@",
        //                 "property": "email",
        //                 "children": [],
        //                 "constraints": {
        //                     "isEmail": "Invalid Email"
        //                 }
        //             }
        //         ]
        //     };

        //     await jest.spyOn(userService, 'registerUser').mockImplementation(() => Promise.resolve(expected));
        //     expect(await authController.register({ email: "houssein@", password: "password" })).toEqual(expected);
        // });

        // it('Test invalid email (simple string + @ + simple string) and valid password.', async () =>
        // {
        //     let expected =
        //     {
        //         "statusCode": 400,
        //         "error": "Bad Request",
        //         "message": [
        //             {
        //                 "target": {
        //                     "email": "houssein@gmail",
        //                     "password": "password"
        //                 },
        //                 "value": "houssein@gmail",
        //                 "property": "email",
        //                 "children": [],
        //                 "constraints": {
        //                     "isEmail": "Invalid Email"
        //                 }
        //             }
        //         ]
        //     };

        //     await jest.spyOn(userService, 'registerUser').mockImplementation(() => Promise.resolve(expected));
        //     expect(await authController.register({ email: "houssein@gmail", password: "password" })).toEqual(expected);
        // });

        // it('Test invalid email (simple string + @ + simple string + .c) and valid password.', async () =>
        // {
        //     let expected =
        //     {
        //         "statusCode": 400,
        //         "error": "Bad Request",
        //         "message": [
        //             {
        //                 "target": {
        //                     "email": "houssein@gmail.c",
        //                     "password": "password"
        //                 },
        //                 "value": "houssein@gmail.c",
        //                 "property": "email",
        //                 "children": [],
        //                 "constraints": {
        //                     "isEmail": "Invalid Email"
        //                 }
        //             }
        //         ]
        //     };

        //     await jest.spyOn(userService, 'registerUser').mockImplementation(() => Promise.resolve(expected));
        //     expect(await authController.register({ email: "houssein@gmail.c", password: "password" })).toEqual(expected);
        // });

        // it('Test with no password but with email.', async () =>
        // {
        //     let expected =
        //     {
        //         "statusCode": 400,
        //         "error": "Bad Request",
        //         "message": [
        //             {
        //                 "target": {
        //                     "email": "houssein.dev@gmail.com"
        //                 },
        //                 "property": "password",
        //                 "children": [],
        //                 "constraints": {
        //                     "minLength": "Invalid Password"
        //                 }
        //             }
        //         ]
        //     };

        //     await jest.spyOn(userService, 'registerUser').mockImplementation(() => Promise.resolve(expected));
        //     expect(await authController.register({ email: "houssein.dev@gmail.com", password: undefined })).toEqual(expected);
        // });

        // it('Test with invalid password (edge case) but with valid email.', async () =>
        // {
        //     let expected =
        //     {
        //         "statusCode": 400,
        //         "error": "Bad Request",
        //         "message": [
        //             {
        //                 "target": {
        //                     "email": "houssein.dev@gmail.com",
        //                     "password": "asdas"
        //                 },
        //                 "value": "asdas",
        //                 "property": "password",
        //                 "children": [],
        //                 "constraints": {
        //                     "minLength": "Invalid Password"
        //                 }
        //             }
        //         ]
        //     };

        //     await jest.spyOn(userService, 'registerUser').mockImplementation(() => Promise.resolve(expected));
        //     expect(await authController.register({ email: "houssein.dev@gmail.com", password: "asdas" })).toEqual(expected);
        // });

        // it('Test with invalid password but with valid email.', async () =>
        // {
        //     let expected =
        //     {
        //         "statusCode": 400,
        //         "error": "Bad Request",
        //         "message": [
        //             {
        //                 "target": {
        //                     "email": "houssein.dev@gmail.com",
        //                     "password": "asd"
        //                 },
        //                 "value": "asd",
        //                 "property": "password",
        //                 "children": [],
        //                 "constraints": {
        //                     "minLength": "Invalid Password"
        //                 }
        //             }
        //         ]
        //     };

        //     await jest.spyOn(userService, 'registerUser').mockImplementation(() => Promise.resolve(expected));
        //     expect(await authController.register({ email: "houssein.dev@gmail.com", password: "asd" })).toEqual(expected);
        // });

        it('Test successful registration.', async () =>
        {
            let expected =
            {
                "statusCode": 201,
                "message": "A new user was created and a verification email was sent to houssein.dev@gmail.com"
            };

            jest.spyOn(userService, 'registerUser').mockImplementation(() => Promise.resolve(expected));
            console.log(await authController.register({ email: "houssein.dev@gmail.com", password: "password" }));
            
            expect(await authController.register({ email: "houssein.dev@gmail.com", password: "password" })).toEqual(expected);
        });

        // it('Test when theres already a pending user.', async () =>
        // {
        //     let expected =
        //     {
        //         "statusCode": 209,
        //         "message": "The provided email is already in use! Verification email was resent!"
        //     };

        //     await jest.spyOn(userService, 'registerUser').mockImplementation(() => Promise.resolve(expected));
        //     expect(await authController.register({ email: "houssein.dev@gmail.com", password: "password" })).toEqual(expected);
        // });
    });

    /************************************ 
        LOGIN UNIT TESTS
    ************************************/
    // describe('/login', () =>
    // {
    //     it('Test with inactive account (correct credentials)', async () =>
    //     {
    //         let expected =
    //         {
    //             "statusCode": 401,
    //             "error": "Unauthorized",
    //             "message": "Username or password was incorrect, or the user has not been verified by email."
    //         };

    //         jest.spyOn(authService, 'login').mockImplementation(() => Promise.resolve(expected));
    //         expect(await authController.login({ email: "houssein.dev@gmail.com", password: "password" })).toEqual(expected);
    //     });

    //     it('Test with inactive account (incorrect password)', async () =>
    //     {
    //         let expected =
    //         {
    //             "statusCode": 401,
    //             "error": "Unauthorized",
    //             "message": "Username or password was incorrect, or the user has not been verified by email."
    //         };

    //         jest.spyOn(authService, 'login').mockImplementation(() => Promise.resolve(expected));
    //         expect(await authController.login({ email: "houssein.dev@gmail.com", password: "wrongpassword" })).toEqual(expected);
    //     });

    //     it('Test with inactive account (incorrect email)', async () =>
    //     {
    //         let expected =
    //         {
    //             "statusCode": 401,
    //             "error": "Unauthorized",
    //             "message": "Username or password was incorrect, or the user has not been verified by email."
    //         };

    //         jest.spyOn(authService, 'login').mockImplementation(() => Promise.resolve(expected));
    //         expect(await authController.login({ email: "wrong.dev@gmail.com", password: "password" })).toEqual(expected);
    //     });
        
    //     // it('Verify account', async () =>
    //     // {
    //     //     let expected =
    //     //     {
    //     //         "statusCode": 401,
    //     //         "error": "Unauthorized",
    //     //         "message": "Username or password was incorrect, or the user has not been verified by email."
    //     //     };


    //     //     jest.spyOn(authService, 'login').mockImplementation(() => Promise.resolve(expected));
    //     //     expect(await authController.login({ email: "houssein.dev@gmail.com", password: "password" })).toEqual(expected);
    //     // });

    //     // it('Test with active account (correct credentials)', async () =>
    //     // {
    //     //     let expected =
    //     //     {
    //     //         "statusCode": 401,
    //     //         "error": "Unauthorized",
    //     //         "message": "Username or password was incorrect, or the user has not been verified by email."
    //     //     };

    //     //     jest.spyOn(authService, 'login').mockImplementation(() => Promise.resolve(expected));
    //     //     expect(await authController.login({ email: "houssein.dev@gmail.com", password: "password" })).toEqual(expected);
    //     // });

    //     // it('Test with active account (incorrect password)', async () =>
    //     // {
    //     //     let expected =
    //     //     {
    //     //         "statusCode": 401,
    //     //         "error": "Unauthorized",
    //     //         "message": "Username or password was incorrect, or the user has not been verified by email."
    //     //     };

    //     //     jest.spyOn(authService, 'login').mockImplementation(() => Promise.resolve(expected));
    //     //     expect(await authController.login({ email: "houssein.dev@gmail.com", password: "wrongpassword" })).toEqual(expected);
    //     // });

    //     // it('Test with active account (incorrect email)', async () =>
    //     // {
    //     //     let expected =
    //     //     {
    //     //         "statusCode": 401,
    //     //         "error": "Unauthorized",
    //     //         "message": "Username or password was incorrect, or the user has not been verified by email."
    //     //     };

    //     //     jest.spyOn(authService, 'login').mockImplementation(() => Promise.resolve(expected));
    //     //     expect(await authController.login({ email: "wrong.dev@gmail.com", password: "password" })).toEqual(expected);
    //     // });


    // });

    afterAll(async () =>
    {
        // await userService.deleteUser("houssein.dev@gmail.com");
    })
});