import { IsEmail, IsNotEmpty, Min, IsString, MinLength  } from 'class-validator';

export class RegisterResponse
{
    readonly email: string;
    readonly message: string;
    readonly isSuccess: boolean;
}

export class RegisterAndLoginRequest
{
    @IsEmail({}, { message: 'Invalid Email' })
    email: string;

    @MinLength(6, { message: 'Invalid Password' })
    password: string;
}