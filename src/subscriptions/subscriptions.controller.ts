import { Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('subscriptions')
@UseGuards(AuthGuard())
export class SubscriptionsController 
{
    @Post("add")
    async addSubscription()
    {
        return "Success!"
    }

    @Post("remove")
    async removeSubscription()
    {
        return "Success!"
    }

    @Post("upcoming")
    async viewUpcomingEpisodes()
    {
        return "Success!"
    }
}
