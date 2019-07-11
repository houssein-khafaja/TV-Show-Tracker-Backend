import { IsEmail, IsNotEmpty, Min, IsString, MinLength, IsNumber } from 'class-validator';
import { isNumber } from 'util';

// export class SubscriptionResponse
// {
//     readonly email: string;
//     readonly message: string;
//     readonly isSuccess: boolean;
// }

export class SubscriptionRequestBody
{
    // @IsNumber({ allowInfinity: false, allowNaN: false },
    //     { message: "showId must be a number" })
    readonly tmdbId: number;
    readonly tvdbId: number;
}

export class SubscriptionRequestHeaders
{
    @IsString({ message: "Authorization header must exist as a string." })
    readonly authorization: string;
}