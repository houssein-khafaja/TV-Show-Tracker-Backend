# TV Show Tracker Backend
This backend stores TV show subscriptions (shows they're following) and provides a way to intereact with TV open databases, such as the [TMDB database](https://www.themoviedb.org/).

I made this project in order showcase my code quality and add a few skills to my arsenal, such as Nest.js, MongoDB and JS unit testing (with Jest). Since this is my first time working with Nest.js and dependency injection, I'm not entirely sure if the app properly uses the framework and design pattern. So I will probably improve this later as I learn more.

# Is there a frontend app to demonstrate?

This backend was supposed to developed with a React Native app, which would have allowed the user to search for TV shows and add them to their "tracked" list. Afterwards, the user would receive notifications to remind them about a show before they air. However, another project has taken my attention, so the release of the front-end app will be delayed indefintely.  

<!-- ## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

What things you need to install the software and how to install them

```
Give examples
```

### Installing

A step by step series of examples that tell you how to get a development env running

Say what the step will be

```
Give the example
```

And repeat

```
until finished
```

End with an example of getting some data out of the system or using it for a little demo -->

# Features
Since this backend was supposed to be developed for a frontend, the only endpoints that were implemented were the ones required by that frontend. With that said, you will not see full CRUD support on every model. More endpoints will be added as needed.

## Built With
* [Nest.js](https://docs.nestjs.com/) - The backend framework which uses Node Express under the hood
* [Typescript](https://www.typescriptlang.org/) - Used by Nest.js out of the box
* [MongoDB and MongoDB Compass](https://www.mongodb.com/) - Database
* [Jest](https://jestjs.io/en/) - JavaScript Testing Framework 
* [Passport](http://www.passportjs.org/) - Authentication Middleware
* [Postman](https://www.getpostman.com/) - API Testing Tool
* [Bcrypt](https://www.npmjs.com/package/bcrypt) - a password hashing library
* [TMDB database](https://www.themoviedb.org/) - to get most of the details of a show
* [TVDB database](https://www.thetvdb.com/) - to get the air times of tv shows

## Authentication
The user is authenticated via Passport's JWT strategy. Here is the general flow of how it works:

### Register
The user will register with an email and password. A verification email is sent to the user with a random alphanumeric token. The user will send that token to the server when they click on the verification link, which will be cross referenced with the list of tokens on the server. User is verified if it finds a token-email match. The user's password is hashed with bcrypt.

### Login
When the user logs in, they will send their email and password to the server. If the provided password passes a bcrypt.compare() test with the hashed password stored in our database, then the user will receive a signed JWT token. The signed token will contain the user's email.

### Accessing Protected Endpoints
Any endpoint that has the AuthGuard decorator means all client requests for that endpoint will automatically be checked for a Bearer token in the authorization heading of the request. If a JWT token is found, it will automatically unsign the JWT token and pass it to a validation method for the server to validate. In the case of this app, we simply check to see if the email inside the token exists in the database. If it does, that means the server was the one that correctly signed this token. However, no action is currently being taken to deal with detecting and/or handling hijacked tokens.

## API Endpoints
Here are a list of routes and their brief descriptions:

### /auth
  * /register
    * Accepts a username and password for registration
  * /login
    * Accepts a username and password for logging in, will return a signed JWT token
  * /verify
    * Accepts an email and verification token, returns an HTML page with a message
  * /ping
    * An AuthGuarded endpoint which lets a client test if their JWT is still valid
### /subscriptions
  * /add
    * Accepts a TMDB ID to add as a subscription
  * /remove
    * Accepts a TMDB ID to remove a susbcription
  * /
    * Returns a list of detailed TV shows that the user is subscribed to
### /tvshow
  * /query
    * Returns a list of relevant TV shows based on a given query, or returns a "popular" list if no query is given
  * /get/:id
    * Accepts a TMDB ID to return details of a specific TV show
# Tests

This project includes 52 unit tests and 47 end-to-end integration tests.

## Break down into unit tests

The unit tests only test the services of the application (which hold most of the logic). They are comprehensive enough to have 99.42% test coverage. At the top of each each .spec file contains the test plan for the respective file, but here is an example snippet:

```
registerUser()

√ [With non existing user & available email] calls doesEmailExist(), getUser() and sendVerificationEmail() with correct params.

√ [With non existing & unavailable email] throws NotFoundException and doesEmailExist() is called with correct params.

√ [With existing & inactive user,  and available email] calls doesEmailExist(), getUser() and sendVerificationEmail() with correct params.

√ [With existing & active user, and available email] throws UnprocessableEntityException and doesEmailExist() is called with correct params.
```

## Break down into end-to-end tests

The unit tests leave out the testing of our controllers, which is where our e2e tests come in. My e2e test are full live tests, meaning you need to have an internet connect and a MongoDB instance running with a localhost account (no credentials). The goal of these tests to test each server endpoint, which is what the controllers handle.

```
/register

√ [With existing email and valid password] returns 201: Verification email was sent

√ [With existing email and valid password (again)] returns 201: Verification email was sent

√ [With non existing email and valid password] returns 404: email does not exist!

√ [With existing email and short password] returns 400: Bad Request Password was not long enough!

√ [With existing email and very long password] returns 201: Verification email was sent

√ [With invalid email and short password] returns 400: Bad Request - Password was not long enough! Email was Invalid!

√ [With existing email and 9 character password] returns 400: Bad Request Password was not long enough!

√ [With existing email and 10 character password] returns 201: Verification email was sent
```

## Folder Structure
* root of src:
  * app.module
  * app-test.module
  * general-interface (contains interfaces that dont belong to just one particular module)
  * main
  * [directory] auth
  * [directory] tvshow
  * [directory] config

Each module folder will contain some, if not all, the following directories:
* root of module directory
  * controllers
  * dto
  * exception-filters
  * interfaces
  * middleware
  * mocks
  * schemas
  * services
  * specs (our unit tests)
  * strategies 

## Author

* **Houssein Khafaja** - [Should I put my LinkedIn here?]


## Acknowledgments

* [ThomRick and jmcdo29 for helping me out in #support of the NestJS Discord Server](https://discord.gg/2ATwk6)
