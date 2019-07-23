import { NotFoundException } from "@nestjs/common";

export const userServiceMock =
{
    registerUser: jest.fn(() => { }),
    deleteUser: jest.fn(() => { }),
    getUser: jest.fn((email: string) => 
    {
        // returns active user
        if (email == "username@email.com")
        {
            return {
                _id: 69,
                email: email,
                password: "$2b$10$dpeZh0MDCz0vSv9UmzfTVuPsn5502QuekHEeBwiphRouvKYyte6MS",
                isActive: true,
                save: () => { return userServiceMock.getUser(email) }
            }
        }
        // returns inactive user
        else if (email == "not_active@email.com")
        {
            return {
                _id: 69,
                email: email,
                password: "$2b$10$dpeZh0MDCz0vSv9UmzfTVuPsn5502QuekHEeBwiphRouvKYyte6MS",
                isActive: false,
                save: () => { return { email }; }
            }
        }
        // returns inactive user with no token
        else if (email == "no_token@email.com")
        {
            return {
                _id: 0,
                email: email,
                password: "$2b$10$dpeZh0MDCz0vSv9UmzfTVuPsn5502QuekHEeBwiphRouvKYyte6MS",
                isActive: false,
                save: () => { return { email }; }
            }
        }
    })
};