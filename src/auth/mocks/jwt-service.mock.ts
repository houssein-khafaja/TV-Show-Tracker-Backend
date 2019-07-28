export const jwtServiceMock =
{
    sign: jest.fn().mockImplementation((payload: { email: string, _userId: number }) => 
    {
        return payload.email;
    })
};