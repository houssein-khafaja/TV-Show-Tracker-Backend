import { Controller, Post, UseGuards, Body, Headers } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionRequestBody, SubscriptionRequestHeaders } from './dto/subscriptions.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('subscriptions')
@UseGuards(AuthGuard())
export class SubscriptionsController 
{
    constructor(private readonly subscriptionsService: SubscriptionsService ) { }

    @Post("add")
    async addSubscription(@Body() req: SubscriptionRequestBody, @Headers() headers: SubscriptionRequestHeaders)
    {
        let userId: string = req.decodedJwt._userId;
        return this.subscriptionsService.addSubscription(userId, req.tmdbId, req.tvdbId);
    }

    @Post("remove")
    async removeSubscription(@Body() req: SubscriptionRequestBody, @Headers() headers: SubscriptionRequestHeaders)
    {
        let userId: string = req.decodedJwt._userId;
        return this.subscriptionsService.deleteSubscription(userId, req.tmdbId, req.tvdbId);
    }

    @Post("upcoming")
    async viewUpcomingEpisodes(@Body() req: SubscriptionRequestBody)
    {
        let userId: string = req.decodedJwt._userId;
        await this.subscriptionsService.getAllSubscriptions(userId);
        // this.subscriptionsService.getAllSubscriptions(userId).subscribe((observer)=>
        // {
        //     console.log(observer.data);
            
        // })
        // console.log(await this.subscriptionsService.getAllSubscriptions(userId).toPromise());
        
        return "this.subscriptionsService.getAllSubscriptions(userId)";
    }

    // decodeAuthToObject(headers: SubscriptionRequestHeaders): { _userId: string }
    // {
    //     let jwtToken: string = headers.authorization.slice(7);
    //     console.log(headers.);
        
    //     return (this.jwtService.decode(jwtToken) as { _userId: string });
    // }
}
