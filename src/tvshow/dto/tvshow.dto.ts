import { IsEmail, IsNotEmpty, Min, IsString, MinLength, IsNumber, IsOptional, IsNumberString } from 'class-validator';
import { isNumber } from 'util';
import { DecodedJwt } from 'src/auth/interfaces/decodedJwt.interface';


export class TvShowRequest
{

    @IsString({ message: "query must be a string" })
    @IsOptional()
    query?: string;

    @IsNumberString({ message: "pageStart must be a number" })
    pageStart: number;

    @IsNumberString({ message: "pageEnd must be a number" })
    pageEnd: number;

}

export class TvShowGetRequestParam
{
    @IsNumberString({ message: "id must be a number" })
    id: number
}

// export class SubscriptionRequestHeaders
// {
//     @IsString({ message: "Authorization header must exist as a string." })
//     readonly authorization: string;
// }