import { Controller, Post, UseGuards, Body, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SubscriptionsService } from '../services/subscriptions.service';
import { SubscriptionRequest } from '../dto/subscriptions.dto';
import { ReturnPayload } from '../../general-interface';
import { Subscription, TvShowModel } from '../interfaces/subscription.interface';
import { DeleteWriteOpResultObject } from 'mongodb';
import { DecodedJwt } from '../../auth/interfaces/decodedJwt.interface';

/**---------------------------------------------------------------------------------------------------------------
 *  Subscriptions Controller
 *
 * The purpose of this controller is to handle the routes related to "subscriptions" of users.
 * What is a subscription? A subscription is just a show that the user is "tracking". It can be thought of as a
 * favorites list. 
 * 
 * Each route handler is pretty simple. They will call the respective functions from a service,
 * then return the results as data. The route handler assumes that error checking and validation 
 * is handled by the injected services and class-validated classes, such as SubscriptionRequest.
 *---------------------------------------------------------------------------------------------------------------*/
@Controller('subscriptions')
@UseGuards(AuthGuard())
export class SubscriptionsController 
{
    constructor(private readonly subscriptionsService: SubscriptionsService) { }

    /**
     * Calls addSubscription from Subscriptions Service to add the desired sub.
     * addSubscription returns the added subscription, but that's just for the
     * sake of completion. We can just wait for it finish, and if it returns 
     * then we know no errors were thrown and it was successful. 
     * @param req the body of the request from the client
     */
    @Post("add")
    async addSubscription(@Body() req: SubscriptionRequest): Promise<ReturnPayload>
    {
        const userId: number = req.decodedJwt._userId;

        // add the sub
        await this.subscriptionsService.addSubscription(userId, req.tmdbID);
        return { statusCode: 201, message: `Subscription was successfully added!` };
    }

    /**
     * Calls deleteSubscription from Subscriptions Service to remove the desired sub.
     * deleteSubscription returns a boolean, but that's just for the sake of completion. 
     * We can just wait for it finish, and if it returns then that means no error was thrown 
     * and was a success. 
     * @param req the body of the request from the client
     */
    @Post("remove")
    async removeSubscription(@Body() req: SubscriptionRequest): Promise<ReturnPayload>
    {
        const userId: number = req.decodedJwt._userId;

        // remove the sub
        await this.subscriptionsService.deleteSubscription(userId, req.tmdbID);
        return { statusCode: 201, message: `Subscription was successfully removed!` }
    }

    /**
     * Calls getAllSubscriptions() from Subscriptions service to return all subs belonging
     * to the user. When a sub is not found, getAllSubscriptions() does not throw an error,
     * so the length of the returned array is check before the response is sent out.
     * @param req the body of the request from the client
     */
    @Get("/")
    async getSubscriptions(@Body() req: { decodedJwt: DecodedJwt }): Promise<ReturnPayload>
    {
        const userId: number = req.decodedJwt._userId;

        let subs: TvShowModel[] = await this.subscriptionsService.getAllSubscriptions(userId);        
        if (subs.length == 0)
        {
            // we actually want to return code 204 but i cant be bothered to figure that out now
            return { statusCode: 200, message: `No subscriptions were found` };
        }
        else
        {
            return { statusCode: 200, message: `Subscriptions were successfully retrieved!`, data: { subs } };
        }
        
    }
}
