import { Controller, Post, UseGuards, Body, Headers, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SubscriptionsService } from '../services/subscriptions.service';
import { SubscriptionRequestBody, SubscriptionRequestHeaders } from '../dto/subscriptions.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('subscriptions')
@UseGuards(AuthGuard())
export class SubscriptionsController 
{
    constructor(private readonly subscriptionsService: SubscriptionsService ) { }

    @Post("add")
    async addSubscription(@Body() req: SubscriptionRequestBody, @Headers() headers: SubscriptionRequestHeaders)
    {
        const userId: string = req.decodedJwt._userId;
        return this.subscriptionsService.addSubscription(userId, req.tmdbId);
    }

    @Post("remove")
    async removeSubscription(@Body() req: SubscriptionRequestBody, @Headers() headers: SubscriptionRequestHeaders)
    {
        const userId: string = req.decodedJwt._userId;
        return this.subscriptionsService.deleteSubscription(userId, req.tmdbId);
    }

    @Get("/")
    async getSubscriptions(@Body() req: SubscriptionRequestBody)
    {
        const userId: string = req.decodedJwt._userId;
        return await this.subscriptionsService.getAllSubscriptions(userId);
    }
}
