let emails: string[] = [
    "not_registered@email.com", // represents an email that exists in the world but not in our DB
    "not_active@email.com", // represents an email that exists in the world, is in our database, but is inactive
    "username@email.com" // represents an email that exists in the world, is in our database, but is active
];

export const emailVerificationServiceMock =
{
    getEmailVerificationToken: jest.fn((_userId: number) => 
    {
        if (_userId == 69)
        {
            return { _userId: 69, token: "EmailVerifyToken" }
        }
        else
        {
            return undefined;
        }
    }),
    sendVerificationEmail: jest.fn((email: string) => emails.includes(email)),
    doesEmailExist: jest.fn((email: string) => emails.includes(email))
};