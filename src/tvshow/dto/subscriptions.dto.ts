import { IsEmail, IsNotEmpty, Min, IsString, MinLength, IsNumber } from 'class-validator';
import { isNumber } from 'util';
import { DecodedJwt } from 'src/auth/interfaces/decodedJwt.interface';


export class SubscriptionRequest
{
    @IsNumber({}, { message: "tmdbID must be a valid number" })
    readonly tmdbID: number;

    readonly decodedJwt: DecodedJwt;
}

// export class SubscriptionRequestHeaders
// {
//     @IsString({ message: "Authorization header must exist as a string." })
//     readonly authorization: string;
// }