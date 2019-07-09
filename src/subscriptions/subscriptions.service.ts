import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription } from './interfaces/subscription.interface';


@Injectable()
export class SubscriptionsService 
{
    constructor(@InjectModel('Subscription') private readonly subscriptionModel: Model<Subscription>) { }

    async addSubscription(jwtToken: string, showId: number)
    {
        
    }
}
