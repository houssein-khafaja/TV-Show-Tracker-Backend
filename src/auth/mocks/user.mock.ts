import { NotFoundException } from "@nestjs/common";

export const hashedPassword: string = "$2b$10$dpeZh0MDCz0vSv9UmzfTVuPsn5502QuekHEeBwiphRouvKYyte6MS";

export const userServiceMock =
{
    registerUser: jest.fn(() => { }),
    // deleteUser: jest.fn(() => { }),
    getUser: jest.fn((email: string) => 
    {
        // returns active user
        if (email == "username@email.com")
        {
            return {
                _id: 69,
                email: email,
                password: hashedPassword,
                isActive: true,
                save: () => { return { email }; }
            }
        }
        // returns inactive user
        else if (email == "not_active@email.com")
        {
            return {
                _id: 69,
                email: email,
                password: hashedPassword,
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
                password: hashedPassword,
                isActive: false,
                save: () => { return { email }; }
            }
        }
        else
        {
            return undefined;
        }
    })
};