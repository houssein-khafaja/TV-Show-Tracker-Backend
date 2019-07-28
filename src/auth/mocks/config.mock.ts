export const configServiceMock =
{
    jwtSecret: jest.fn(() => "secretKey"),
    email: jest.fn(() => "twiglaser@gmail.com"),
    password: jest.fn(() => "***REMOVED***"),
};