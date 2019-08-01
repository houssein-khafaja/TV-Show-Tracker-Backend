/**-------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 *  Integration Test [Entire App]
 *
 *  Test Plan:
 *      - App should be defined    
 *
 *  - /Auth
 *      - /register (while user is still unverified)
 *          -[With existing email and valid password] returns 201: Verification email was sent
 *          -[With existing email and valid password (again)] returns 201: Verification email was sent
 *          -[With non existing email and valid password] returns 404: email does not exist!
 *          -[With existing email and short password] returns 400: Bad Request Password was not long enough!
 *          -[With existing email and very long password] returns 201: Verification email was sent
 *          -[With invalid email and short password] returns 400: Bad Request - Password was not long enough! Email was Invalid!
 *          -[With existing email and 9 character password] returns 400: Bad Request Password was not long enough!
 *          -[With existing email and 10 character password] returns 201: Verification email was sent
 * 
 *      - /register (while user is verified)
 *          -[With existing email and valid password] returns 422: User already exists and is verified.         
 * 
 *      - /verify
 *          -[With incorrect email and correct token] returns 404: User was not found!
 *          -[With correct email (unverified) and incorrect token] returns 200: Email was NOT verified! Please re-register to resend the verification link.
 *          -[With correct email and token] returns 200: successfully verified!
 *          -[With correct email and token (again)] returns 200: Email is already verified!
 *          
 *      - /login
 *          -[With correct email, correct password of an active user] returns 201: message: Login Success!, data: { jwtToken }
 *          -[With correct email, correct password of an inactive user] returns 401: message: Username or password was incorrect, or the user has not been verified by email.
 *          -[With correct email, incorrect password of an active user] returns 401: Username or password was incorrect, or the user has not been verified by email.
 *          -[With incorrect email, correct password of an active user] returns 401: Username or password was incorrect, or the user has not been verified by email.
 *          -[With invalid email, correct password of an active user] returns 400: Bad Request - Email was Invalid!
 *          -[With correct email, invalid password of an active user] returns 400: Bad Request - Password was not long enough!
 *          -[With invalid email, invalid password of an active user] returns 400: Bad Request - Password was not long enough! Email was Invalid!
 * 
 *      - /ping
 *          -[with valid jwt token] returns 201: message: "Token Valid!"" }
 *          -[with invalid jwt token] returns 401: error:"Unauthorized"}
 * 
 *  - /subscriptions
 *      - /add
 *          -[with invalid jwt token] returns 401: error:"Unauthorized"}
 *          -// with valid jwt tokens onwards
 *          -[With tmdbID not currently in our subs list] returns 201: message: Subscription was successfully added!
 *          -[With tmdbID currently in our subs list] returns 409: message: Subscription already exists for this user.
 * 
 *      - /remove
 *          -[with invalid jwt token] returns 401: error:"Unauthorized"}
 *          -// with valid jwt tokens onwards
 *          -[With tmdbID currently in our subs list] returns 201: message: Subscription was successfully removed!
 *          -[With tmdbID not currently in our subs list] returns 409: message: Susbcription was not found.
 * 
 *      - /
 *          -[with invalid jwt token] returns 401: error:"Unauthorized"}
 *          -[with valid jwt token (while we have subs in the list)] returns 201: message: Subscriptions were successfully retrieved! with appropriate data
 *          -[with valid jwt token (while we have no subs)] returns 201: message: No subscriptions were found!
 * 
 *  - /tvshow
 *      - /query
 *          -[with invalid jwt token] returns 401: error:"Unauthorized"}
 *          -// with valid jwt tokens onwards
 *          -[With pageStart > pageEnd] throws BadRequestException
 *          -[With pageStart=1, pageEnd=1, "star wars" query given] returns 200: with appropriate data (containing star wars)
 *          -[With pageStart=1, pageEnd=1, no query given] returns 200: with some data (cant predict this)
 *          -[With pageStart=1, pageEnd=3, "star wars" query given] returns 200: appropriate data (containing star wars)
 *          -[With pageStart=1, pageEnd not given, "star wars" query given] returns 400: pageEnd must be a number
 *          -[With pageStart not given, pageEnd=4, "star wars" query given] returns 400: pageStart must be a number
 *          -[With no params] returns 400: pageStart and pageEnd must be a number
 * 
 *      - /get/:id
 *          -[with invalid jwt token] returns 401: error:"Unauthorized"}
 *          -// with valid jwt tokens onwards
 *          -[With valid tmdbID] returns 200: with a show named "Pride"
 *          -[With string "asd"] returns 400: Bad Request
 * 
 *-------------------------------------------------------------------------------------------------------------------------------------------------------------------------**/
import { ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from 'supertest';
import { MongoClient, Db } from 'mongodb';
import { NestExpressApplication } from "@nestjs/platform-express";
import * as path from 'path';
import { AppTestModule } from "../src/app-test.module";

describe('App', () =>
{
    let connection: MongoClient;
    let db: Db;
    let app: NestExpressApplication;
    let emailVerificationToken: string;
    let jwtToken: string;
    let httpServer;

    beforeAll(async () =>
    {
        connection = await MongoClient.connect('mongodb://localhost', {
            useNewUrlParser: true,
        });

        db = await connection.db("appTest");

        const module = await Test.createTestingModule({
            imports: [AppTestModule]
        }).compile();

        // stuff you would see in main.ts
        app = module.createNestApplication();
        app.setBaseViewsDir(path.join(__dirname, '..', 'views'));
        app.setViewEngine('hbs');
        app.useGlobalPipes(new ValidationPipe({ transform: true, validationError: { target: false, value: false } }));
        await app.init();

        // the server instance we use to send requests
        httpServer = app.getHttpServer();
    });

    it(`defined`, () =>
    {
        expect(app).toBeDefined();
    });

    /*****************************************************************************************************************************************
     * Auth Controller
     *****************************************************************************************************************************************/
    describe('/auth', () =>
    {
        /******************************************
         * register
         ******************************************/
        describe('/register', () =>
        {
            it(`[With existing email and valid password] returns 201: Verification email was sent`, () =>
            {
                return request(httpServer)
                    .post('/auth/register')
                    .send({ email: 'houssein.dev@gmail.com', password: 'password123' })
                    .expect(201)
                    .expect({
                        "statusCode": 201,
                        "message": "Verification email was sent to: houssein.dev@gmail.com"
                    })
            });

            it(`[With existing email and valid password (again)] returns 201: Verification email was sent`, () =>
            {
                return request(httpServer)
                    .post('/auth/register')
                    .send({ email: 'houssein.dev@gmail.com', password: 'password123' })
                    .expect(201)
                    .expect({
                        "statusCode": 201,
                        "message": "Verification email was sent to: houssein.dev@gmail.com"
                    })
            });

            it(`[With non existing email and valid password] returns 404: email does not exist!`, () =>
            {
                return request(httpServer)
                    .post('/auth/register')
                    .send({ email: 'asdsadwafdasfsafcasd@gmail.com', password: 'password123' })
                    .expect(404)
                    .expect({
                        "statusCode": 404,
                        "error": "Not Found",
                        "message": "The email: asdsadwafdasfsafcasd@gmail.com does not exist! Please provide a real email to verify your account."
                    })
            });

            it(`[With existing email and short password] returns 400: Bad Request - Password was not long enough!`, () =>
            {
                return request(httpServer)
                    .post('/auth/register')
                    .send({ email: 'houssein.dev@gmail.com', password: 'asd' })
                    .expect(400)
                    .expect({
                        "statusCode": 400,
                        "error": "Bad Request",
                        "message": [
                            {
                                "property": "password",
                                "children": [],
                                "constraints": {
                                    "minLength": "Password was not long enough!"
                                }
                            }
                        ]
                    })
            });

            it(`[With existing email and very long password] returns 201: Verification email was sent`, (done) =>
            {
                return request(httpServer)
                    .post('/auth/register')
                    .send({ email: 'houssein.dev@gmail.com', password: 'asdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasdasdfwasdasd' })
                    .expect(201)
                    .expect({
                        "statusCode": 201,
                        "message": "Verification email was sent to: houssein.dev@gmail.com"
                    }, done)
            });

            it(`[With invalid email and short password] returns 400: Bad Request - Password was not long enough! Email was Invalid!`, (done) =>
            {
                return request(httpServer)
                    .post('/auth/register')
                    .send({ email: 'adds', password: 'asd' })
                    .expect(400)
                    .expect({
                        "statusCode": 400,
                        "error": "Bad Request",
                        "message": [
                            {
                                "property": "email",
                                "children": [],
                                "constraints": {
                                    "isEmail": "Email was invalid!"
                                }
                            },
                            {
                                "property": "password",
                                "children": [],
                                "constraints": {
                                    "minLength": "Password was not long enough!"
                                }
                            }
                        ]
                    }, done)
            });

            it(`[With existing email and 9 character password] returns 400: Bad Request Password was not long enough!`, (done) =>
            {
                return request(httpServer)
                    .post('/auth/register')
                    .send({ email: 'houssein.dev@gmail.com', password: 'asd123asd' })
                    .expect(400)
                    .expect({
                        "statusCode": 400,
                        "error": "Bad Request",
                        "message": [
                            {
                                "property": "password",
                                "children": [],
                                "constraints": {
                                    "minLength": "Password was not long enough!"
                                }
                            }
                        ]
                    }, done)
            });

            it(`[With existing email and 10 character password] returns 201: Verification email was sent`, (done) =>
            {
                return request(httpServer)
                    .post('/auth/register')
                    .send({ email: 'houssein.dev@gmail.com', password: 'asd123asd1' })
                    .expect(201)
                    .expect({
                        "statusCode": 201,
                        "message": "Verification email was sent to: houssein.dev@gmail.com"
                    }, done)
            });
        });

        
        /******************************************
         * verify
         ******************************************/
        describe("/verify", () =>
        {
            it(`[With incorrect email and correct token] returns 404: User was not found!`, async () =>
            {
                const users = db.collection('users');
                const emailVerificationTokens = db.collection('emailverificationtokens');
                const user = await users.findOne({ email: "houssein.dev@gmail.com" });
                emailVerificationToken = (await emailVerificationTokens.findOne({ _userId: user._id })).token;

                return request(httpServer)
                    .get(`/auth/verify?verification=${emailVerificationToken}&email=incorrect.email.dev@gmail.com`)
                    .expect(404)
                    .expect({ "statusCode": 404, "error": "Not Found", "message": "User was not found!" });
            });

            it(`[With correct email (unverified) and incorrect token] returns 200: Email was NOT verified! Please re-register to resend the verification link.`, async () =>
            {
                let verifiyResponse = await request(httpServer)
                    .get(`/auth/verify?verification=asd&email=houssein.dev@gmail.com`)
                    .expect(200);
                expect(verifiyResponse.text).toMatch("Email was NOT verified! Please re-register to resend the verification link");
            });

            it(`[[/login] With correct email, correct password of an inactive user] returns 401: message: Username or password was incorrect, or the user has not been verified by email.`, async () =>
            {
                return request(httpServer)
                    .post('/auth/login')
                    .send({ email: 'houssein.dev@gmail.com', password: 'password123' })
                    .expect(401)
                    .expect({
                        "statusCode": 401,
                        "error": "Unauthorized",
                        "message": "Username or password was incorrect, or the user has not been verified by email."
                    });
            });

            it(`[With correct email and token] returns 200: successfully verified!`, async () =>
            {
                let verifiyResponse = await request(httpServer)
                    .get(`/auth/verify?verification=${emailVerificationToken}&email=houssein.dev@gmail.com`)
                    .expect(200);
                expect(verifiyResponse.text).toMatch("successfully verified!");
            });

            it(`[With correct email and token (again)] returns 200: Email is already verified!`, async () =>
            {
                let verifiyResponse = await request(httpServer)
                    .get(`/auth/verify?verification=${emailVerificationToken}&email=houssein.dev@gmail.com`)
                    .expect(200);
                expect(verifiyResponse.text).toMatch("Email is already verified!");
            });

            it(`[/register continued: With existing email and valid password] returns 422: User already exists and is verified.`, async () =>
            {
                // try to register, we expect it wont so well this time
                await request(httpServer)
                    .post('/auth/register')
                    .send({ email: 'houssein.dev@gmail.com', password: 'password123' })
                    .expect(422)
                    .expect({
                        "statusCode": 422,
                        "error": "Unprocessable Entity",
                        "message": "User already exists and is verified."
                    });
            });
        });

        /******************************************
         * login
         ******************************************/
        describe("/login", () =>
        {
            it(`[With correct email, correct password of an active user] returns 201: message: Login Success!, data: { jwtToken }`, async () =>
            {
                let response = await request(httpServer)
                    .post('/auth/login')
                    .send({ email: 'houssein.dev@gmail.com', password: 'password123' })
                    .expect(201);
                jwtToken = response.body.data.jwtToken;
                expect(response.body.message).toBe("Login Success!")
            });

            it(`[With correct email, incorrect password of an active user] returns 401: Username or password was incorrect, or the user has not been verified by email.`, async () =>
            {
                return request(httpServer)
                    .post('/auth/login')
                    .send({ email: 'houssein.dev@gmail.com', password: 'asddsaqwed' })
                    .expect(401)
                    .expect({
                        "statusCode": 401,
                        "error": "Unauthorized",
                        "message": "Username or password was incorrect, or the user has not been verified by email."
                    });
            });

            it(`[With incorrect email, correct password of an active user] returns 401: Username or password was incorrect, or the user has not been verified by email.`, async () =>
            {
                return request(httpServer)
                    .post('/auth/login')
                    .send({ email: 'dwqa.dev@gmail.com', password: 'password123' })
                    .expect(404)
                    .expect({
                        "statusCode": 404,
                        "error": "Not Found",
                        "message": "User was not found!"
                    });
            });

            it(`[With invalid email, correct password of an active user] returns 400: Bad Request - Email was Invalid!`, async () =>
            {
                return request(httpServer)
                    .post('/auth/login')
                    .send({ email: 'asd', password: 'password123' })
                    .expect(400)
                    .expect({
                        "statusCode": 400,
                        "error": "Bad Request",
                        "message": [
                            {
                                "property": "email",
                                "children": [],
                                "constraints": {
                                    "isEmail": "Email was invalid!"
                                }
                            }
                        ]
                    });
            });

            it(`[With correct email, invalid password of an active user] returns 400: Bad Request - Password was not long enough!`, async () =>
            {
                return request(httpServer)
                    .post('/auth/login')
                    .send({ email: 'houssein.dev@gmail.com', password: 'asd' })
                    .expect(400)
                    .expect({
                        "statusCode": 400,
                        "error": "Bad Request",
                        "message": [
                            {
                                "property": "password",
                                "children": [],
                                "constraints": {
                                    "minLength": "Password was not long enough!"
                                }
                            }
                        ]
                    });
            });

            it(`[With invalid email, invalid password of an active user] returns 400: Bad Request - Password was not long enough! Email was Invalid!`, async () =>
            {
                return request(httpServer)
                    .post('/auth/login')
                    .send({ email: 'asd', password: 'asd' })
                    .expect(400)
                    .expect({
                        "statusCode": 400,
                        "error": "Bad Request",
                        "message": [
                            {
                                "property": "email",
                                "children": [],
                                "constraints": {
                                    "isEmail": "Email was invalid!"
                                }
                            },
                            {
                                "property": "password",
                                "children": [],
                                "constraints": {
                                    "minLength": "Password was not long enough!"
                                }
                            }
                        ]
                    });
            });
        })

        /******************************************
         * ping
         ******************************************/
        describe("/ping", () =>
        {
            it("[with valid jwt token] returns 201: message: 'Token Valid!' }", () =>
            {
                return request(httpServer)
                    .get('/auth/ping')
                    .set('Authorization', 'bearer ' + jwtToken)
                    .expect(200)
                    .expect({
                        "statusCode": 200,
                        "message": "Token Valid!"
                    });
            })

            it("[with valid jwt token] returns 201: message: 'Token Valid!' }", () =>
            {
                return request(httpServer)
                    .get('/auth/ping')
                    .set('Authorization', 'bearer ' + "jwtToken")
                    .expect(401)
                    .expect({
                        "statusCode": 401,
                        "error": "Unauthorized"
                    });
            })
        });
    });

    
    /*****************************************************************************************************************************************
     * Subscriptions Controller
     *****************************************************************************************************************************************/
    describe("/subscriptions", () =>
    {
        
        /******************************************
         * Add
         ******************************************/
        describe("/add", () =>
        {
            it("[with invalid jwt token] returns 401: error:'Unauthorized'}", () =>
            {
                return request(httpServer)
                    .post('/subscriptions/add')
                    .set('Authorization', 'bearer ' + "jwtToken")
                    .expect(401)
                    .expect({
                        "statusCode": 401,
                        "error": "Unauthorized"
                    });
            })

            it("[With tmdbID = 1] returns 201: message: Subscription was successfully added!", () =>
            {
                return request(httpServer)
                    .post('/subscriptions/add')
                    .set('Authorization', 'bearer ' + jwtToken)
                    .send({ tmdbID: 1 })
                    .expect(201)
                    .expect({
                        "statusCode": 201,
                        "message": "Subscription was successfully added!"
                    });
            })

            it("[With tmdbID = 2] returns 201: message: Subscription was successfully added!", () =>
            {
                return request(httpServer)
                    .post('/subscriptions/add')
                    .set('Authorization', 'bearer ' + jwtToken)
                    .send({ tmdbID: 2 })
                    .expect(201)
                    .expect({
                        "statusCode": 201,
                        "message": "Subscription was successfully added!"
                    });
            })

            it("[With tmdbID = 3] returns 201: message: Subscription was successfully added!", () =>
            {
                return request(httpServer)
                    .post('/subscriptions/add')
                    .set('Authorization', 'bearer ' + jwtToken)
                    .send({ tmdbID: 3 })
                    .expect(201)
                    .expect({
                        "statusCode": 201,
                        "message": "Subscription was successfully added!"
                    });
            })

            it("[With tmdbID = 3] returns 201: message: Subscription was successfully added!", () =>
            {
                return request(httpServer)
                    .post('/subscriptions/add')
                    .set('Authorization', 'bearer ' + jwtToken)
                    .send({ tmdbID: 3 })
                    .expect(409)
                    .expect({
                        "statusCode": 409,
                        "error": "Conflict",
                        "message": "Subscription already exists for this user."
                    });
            })
        });

        
        /******************************************
         * / (GET all subs)
         ******************************************/
        describe("/", () =>
        {
            it("[with invalid jwt token] returns 401: error:'Unauthorized'}", () =>
            {
                return request(httpServer)
                    .get('/subscriptions')
                    .set('Authorization', 'bearer ' + "jwtToken")
                    .expect(401)
                    .expect({
                        "statusCode": 401,
                        "error": "Unauthorized"
                    });
            });

            it("[with valid jwt token (while we have subs in the list)] returns 201: message: Subscriptions were successfully retrieved! with appropriate data", async () =>
            {
                let response = await request(httpServer)
                    .get('/subscriptions')
                    .set('Authorization', 'bearer ' + jwtToken)
                    .expect(200);

                expect(response.body.message).toBe("Subscriptions were successfully retrieved!");
                expect(response.body.data.subs).toHaveLength(3);
                expect(response.body.data.subs[0].name).toBeDefined();
                expect(response.body.data.subs[1]).toBeDefined();
                expect(response.body.data.subs[2]).toBeDefined();
            })

            
            /******************************************
             * remove
             ******************************************/
            describe("/remove", () =>
            {
                it("[with invalid jwt token] returns 401: error:'Unauthorized'}", () =>
                {
                    return request(httpServer)
                        .post('/subscriptions/remove')
                        .set('Authorization', 'bearer ' + "jwtToken")
                        .expect(401)
                        .expect({
                            "statusCode": 401,
                            "error": "Unauthorized"
                        });
                });

                it("[with valid jwt token (while we have subs in the list)] returns 201: message: Subscription was successfully removed!", async () =>
                {
                    return request(httpServer)
                        .post('/subscriptions/remove')
                        .set('Authorization', 'bearer ' + jwtToken)
                        .expect(201)
                        .send({ tmdbID: 1 })
                        .expect({
                            "statusCode": 201,
                            "message": "Subscription was successfully removed!"
                        });
                })

                it("[with valid jwt token (while we have subs in the list)] returns 201: message: Subscription was successfully removed!", async () =>
                {
                    return request(httpServer)
                        .post('/subscriptions/remove')
                        .set('Authorization', 'bearer ' + jwtToken)
                        .expect(201)
                        .send({ tmdbID: 2 })
                        .expect({
                            "statusCode": 201,
                            "message": "Subscription was successfully removed!"
                        });
                })

                it("[with valid jwt token (while we have subs in the list)] returns 201: message: Subscription was successfully removed!", async () =>
                {
                    return request(httpServer)
                        .post('/subscriptions/remove')
                        .set('Authorization', 'bearer ' + jwtToken)
                        .expect(201)
                        .send({ tmdbID: 3 })
                        .expect({
                            "statusCode": 201,
                            "message": "Subscription was successfully removed!"
                        });
                })

                it("[With tmdbID not currently in our subs list] returns 409: message: Susbcription was not found.", async () =>
                {
                    return request(httpServer)
                        .post('/subscriptions/remove')
                        .set('Authorization', 'bearer ' + jwtToken)
                        .expect(404)
                        .send({ tmdbID: 3 })
                        .expect({
                            "statusCode": 404,
                            "error": "Not Found",
                            "message": "Susbcription was not found."
                        });
                })
            })

            it("[with valid jwt token (while we have no subs)] returns 201: message: No subscriptions were found!", async () =>
            {
                return request(httpServer)
                    .get('/subscriptions')
                    .set('Authorization', 'bearer ' + jwtToken)
                    .expect(200)
                    .expect({
                        "statusCode": 200,
                        "message": "No subscriptions were found"
                    });
            })
        })
    });

    /*****************************************************************************************************************************************
     * TV Show Controller
     *****************************************************************************************************************************************/
    describe("/tvshow", () =>
    {
        /******************************************
         * query
         ******************************************/
        describe("/query", () =>
        {
            it("[with invalid jwt token] returns 401: error:'Unauthorized'}", () =>
            {
                return request(httpServer)
                    .get('/tvshow/query')
                    .set('Authorization', 'bearer ' + "jwtToken")
                    .expect(401)
                    .expect({
                        "statusCode": 401,
                        "error": "Unauthorized"
                    });

            });

            it("[With pageStart > pageEnd] throws BadRequestException", () =>
            {
                return request(httpServer)
                    .get('/tvshow/query?pageStart=3&pageEnd=1')
                    .set('Authorization', 'bearer ' + jwtToken)
                    .expect(400)
                    .expect({
                        "statusCode": 400,
                        "error": "Bad Request",
                        "message": "Doesn't make sense for pageStart to be greater than pageEnd!"
                    });

            });

            it("[With pageStart=1, pageEnd=1, 'star wars' query given] returns appropriate data (containing star wars)", async () =>
            {
                let response = await request(httpServer)
                    .get('/tvshow/query?pageStart=1&pageEnd=1&query=star%20wars')
                    .set('Authorization', 'bearer ' + jwtToken)
                    .expect(200);
                expect(response.body.message).toBe("Query was successful!");
                expect(response.body.data.queriedShows[0].name).toMatch("Star Wars");
            });

            it("[With pageStart=1, pageEnd=1, no query given] returns some data (cant predict this)", async () =>
            {
                let response = await request(httpServer)
                    .get('/tvshow/query?pageStart=1&pageEnd=1')
                    .set('Authorization', 'bearer ' + jwtToken)
                    .expect(200);
                expect(response.body.message).toBe("Query was successful!");
                expect(response.body.data.queriedShows[0].name).toBeDefined();

            });

            it("[With pageStart=1, pageEnd=3, 'star wars' query given] returns appropriate data (containing star and/or wars)", async () =>
            {
                let response = await request(httpServer)
                    .get('/tvshow/query?pageStart=1&pageEnd=3&query=star%20wars')
                    .set('Authorization', 'bearer ' + jwtToken)
                    .expect(200);
                expect(response.body.message).toBe("Query was successful!");
                expect(response.body.data.queriedShows[0].name).toMatch("Star Wars");
            });

            it("[With pageStart=1, pageEnd not given, star wars query given] returns 400: pageEnd must be a number", () =>
            {
                return request(httpServer)
                    .get('/tvshow/query?pageStart=1&query=star%20wars')
                    .set('Authorization', 'bearer ' + jwtToken)
                    .expect(400)
                    .expect({
                        "statusCode": 400,
                        "error": "Bad Request",
                        "message": [
                            {
                                "property": "pageEnd",
                                "children": [],
                                "constraints": {
                                    "isNumberString": "pageEnd must be a number"
                                }
                            }
                        ]
                    });

            });

            it("[With pageStart not given, pageEnd=4, star wars query given] returns 400: pageStart must be a number", () =>
            {
                return request(httpServer)
                    .get('/tvshow/query?pageEnd=4&query=star%20wars')
                    .set('Authorization', 'bearer ' + jwtToken)
                    .expect(400)
                    .expect({
                        "statusCode": 400,
                        "error": "Bad Request",
                        "message": [
                            {
                                "property": "pageStart",
                                "children": [],
                                "constraints": {
                                    "isNumberString": "pageStart must be a number"
                                }
                            }
                        ]
                    });
            });

            it("[With no params] returns 400: pageStart and pageEnd must be a number", () =>
            {
                return request(httpServer)
                    .get('/tvshow/query')
                    .set('Authorization', 'bearer ' + jwtToken)
                    .expect(400)
                    .expect({
                        "statusCode": 400,
                        "error": "Bad Request",
                        "message": [
                            {
                                "property": "pageStart",
                                "children": [],
                                "constraints": {
                                    "isNumberString": "pageStart must be a number"
                                }
                            },
                            {
                                "property": "pageEnd",
                                "children": [],
                                "constraints": {
                                    "isNumberString": "pageEnd must be a number"
                                }
                            }
                        ]
                    });

            });
        });

        /******************************************
         * get/:id
         ******************************************/
        describe("/get/:id", () =>
        {
            it("[with invalid jwt token] returns 401: error:'Unauthorized'}", () =>
            {
                return request(httpServer)
                    .get('/tvshow/get/1')
                    .set('Authorization', 'bearer ' + "jwtToken")
                    .expect(401)
                    .expect({
                        "statusCode": 401,
                        "error": "Unauthorized"
                    });
            });

            it("[With valid tmdbID] returns 200: with a show named 'Pride'", async () =>
            {
                let response = await request(httpServer)
                    .get('/tvshow/get/1')
                    .set('Authorization', 'bearer ' + jwtToken)
                    .expect(200);
                expect(response.body.data.show.name).toBe("Pride");

            });

            it("[With string 'asd'] returns 400: Bad Request", () =>
            {
                return request(httpServer)
                    .get('/tvshow/get/asd')
                    .set('Authorization', 'bearer ' + jwtToken)
                    .expect(400)
                    .expect({
                        "statusCode": 400,
                        "error": "Bad Request",
                        "message": [
                            {
                                "property": "id",
                                "children": [],
                                "constraints": {
                                    "isNumberString": "id must be a number"
                                }
                            }
                        ]
                    });
            });
        });

    });

    afterAll(async () =>
    {
        await db.dropDatabase();
        await connection.close();
    });
})
