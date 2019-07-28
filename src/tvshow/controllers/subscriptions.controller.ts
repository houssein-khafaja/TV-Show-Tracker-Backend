import { Controller, Post, UseGuards, Body, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SubscriptionsService } from '../services/subscriptions.service';
import { SubscriptionRequest } from '../dto/subscriptions.dto';
import { ReturnPayload } from 'src/interfaces/general';
import { Subscription, TvShowModel } from '../interfaces/subscription.interface';
import { DeleteWriteOpResultObject } from 'mongodb';
import { DecodedJwt } from 'src/auth/interfaces/decodedJwt.interface';

@Controller('subscriptions')
@UseGuards(AuthGuard())
export class SubscriptionsController 
{
    constructor(private readonly subscriptionsService: SubscriptionsService) { }

    @Post("add")
    async addSubscription(@Body() req: SubscriptionRequest): Promise<ReturnPayload>
    {
        const userId: string = req.decodedJwt._userId;

        // add the sub
        let addedSub: Subscription = await this.subscriptionsService.addSubscription(userId, req.tmdbID);
        console.log(addedSub);

        return { statusCode: 201, message: `Subscription was successfully added!` }

    }

    @Post("remove")
    async removeSubscription(@Body() req: SubscriptionRequest): Promise<ReturnPayload>
    {
        const userId: string = req.decodedJwt._userId;

        // remove the sub
        let removedSub: DeleteWriteOpResultObject['result'] = await this.subscriptionsService.deleteSubscription(userId, req.tmdbID);
        console.log(removedSub);

        return { statusCode: 201, message: `Subscription was successfully removed!` }
    }

    @Get("/")
    async getSubscriptions(@Body() req: { decodedJwt: DecodedJwt }): Promise<ReturnPayload>
    {
        const userId: string = req.decodedJwt._userId;
        let subs: TvShowModel[] = await this.subscriptionsService.getAllSubscriptions(userId);

        return { statusCode: 201, message: `Subscriptions were successfully retrieved!`, data: { subs } };
    }
}
