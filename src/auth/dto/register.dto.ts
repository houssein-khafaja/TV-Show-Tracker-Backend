import { IsEmail, IsNotEmpty, Min, IsString, MinLength  } from 'class-validator';

export class RegisterResponse
{
    readonly email: string;
    readonly message: string;
    readonly isSuccess: boolean;
}

export class RegisterRequest
{
    @IsEmail({}, { message: 'Invalid Email' })
    readonly email: string;

    @MinLength(6, { message: 'Invalid Password' })
    readonly password: string;
}