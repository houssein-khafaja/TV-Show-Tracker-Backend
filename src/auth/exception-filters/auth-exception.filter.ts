import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { MongoError } from 'mongodb';

@Catch(MongoError)
export class MongoExceptionFilter implements ExceptionFilter
{
    catch(exception: MongoError, host: ArgumentsHost)
    {
        const response = host.switchToHttp().getResponse<Response>();

        let errorCode: number;/*  = exception.code == 11000 ? 409: 500; */
        let message: string;

        switch (exception.code)
        {
            // 11000 means duplicate key in that case we want 
            // to return code 409, otherwise we default to 500
            case 11000:
                errorCode = 409;
                message = "Username already exists! If its not activated, we will resend the activation email."
                break;

            default:
                errorCode = 500;
                message = "Internal Server Error. Please try again later."
                break;
        }

        response
            .status(errorCode)
            .json({
                statusCode: errorCode,
                message
            });
    }
}