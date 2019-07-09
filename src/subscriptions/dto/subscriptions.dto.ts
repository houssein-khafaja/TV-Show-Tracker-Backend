import { IsEmail, IsNotEmpty, Min, IsString, MinLength, IsNumber  } from 'class-validator';
import { isNumber } from 'util';

export class SubscriptionResponse
{
    readonly email: string;
    readonly message: string;
    readonly isSuccess: boolean;
}

export class SubscriptionRequest
{
    @IsNumber({allowInfinity: false, allowNaN: false}, 
            {message: "showId must be a number"})
    readonly showId: number;
}