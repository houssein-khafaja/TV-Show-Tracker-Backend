import { IsEmail, MinLength, IsString, IsAlphanumeric } from "class-validator";

export class RegisterAndLoginRequest
{
    @IsEmail({}, { message: "Email was invalid!", })
    email: string;

    @MinLength(10, { message: "Password was not long enough!", })
    password: string;
}

export class VerifyRequest
{
    @IsEmail({}, { message: "Email was invalid!", })
    email: string;

    @IsAlphanumeric({ message: "Verification token was not a proper string!", })
    verification: string;
}