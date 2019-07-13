import { Injectable, InternalServerErrorException, NotFoundException, NotAcceptableException, HttpService } from '@nestjs/common';
import { SubscriptionResponse } from '../interfaces/subscription.interface';

@Injectable()
export class TmdbService 
{
    constructor(private readonly httpService: HttpService) { }

    async getPopularShows()
    {
        const pagesToGet: number = 10;
        
        const dataToReturn: SubscriptionResponse[] = [];

        for (let i = 0; i < pagesToGet; i++)
        {
            const element = pagesToGet
        }
        
    }
}
