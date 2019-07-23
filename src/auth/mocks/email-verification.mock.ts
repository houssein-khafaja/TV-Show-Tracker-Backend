export const emailVerificationServiceMock =
{
    getEmailVerificationToken: jest.fn((_userId: number) => 
    {
        console.log(_userId);
        
        if (_userId == 69)
        {
            return { _userId: 69, token: "EmailVerifyToken" }
        }
        else
        {
            return undefined;
        }
    }),
    sendVerificationEmail: jest.fn(),
    doesEmailExist: jest.fn()
};