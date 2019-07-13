import { Injectable, NotFoundException, ConflictException, HttpService } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription, SubscriptionResponse } from '../interfaces/subscription.interface';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/auth/interfaces/user.interface';
import { UserService } from 'src/auth/services/user.service';
import { Observable } from 'rxjs';
import { AxiosResponse, AxiosRequestConfig } from 'axios';
import { ConfigService } from 'src/config.service';


@Injectable()
export class SubscriptionsService 
{
    constructor(@InjectModel('Subscription') private readonly subscriptionModel: Model<Subscription>,
        private readonly userService: UserService,
        private readonly httpService: HttpService,
        private readonly config: ConfigService) { }

    async addSubscription(_userId: string, tmdbId: number): Promise<{}>
    {
        // try to find sub
        const subExists: Subscription = await this.getSubscription(_userId, tmdbId)

        // if we dont find one, add the new sub
        if (!subExists)
        {
            const newSubscription: Subscription = new this.subscriptionModel({ _userId, tmdbId });
            const result: Subscription = await newSubscription.save();
            if (result)
            {
                return { statusCode: 201, message: "Subscription Added" }
            }
        }
        // if we find one, throw exception
        else
        {
            throw new ConflictException("Subscription already exists for this user.");
        }
    }

    async deleteSubscription(_userId: string, tmdbId: number): Promise<{}>
    {
        const result: { ok?: number; n?: number; deletedCount?: number } = await this.subscriptionModel.deleteOne({ _userId, tmdbId }).exec();

        if (result.deletedCount == 1)
        {
            return { statusCode: 201, message: "Subscription deleted" };
        }
        else
        {
            throw new NotFoundException("Susbcription was not found.");
        }
    }

    async getSubscription(_userId: string, tmdbId: number): Promise<Subscription> | null
    {
        return await this.subscriptionModel.findOne({ _userId, tmdbId });
    }

    async getAllSubscriptions(_userId: string)
    {
        // we need to make a batch  of requests to TMDB so we will save them as promises
        let requestPromises: Promise<AxiosResponse>[] = [];
        
        // this array will hold all of the data objects we will send back
        const subscriptionsToSend: SubscriptionResponse[] = [];

        // get all sub ids from DB
        const subscriptionsFromDB: Subscription[] = await this.subscriptionModel.find({ _userId });

        // for each sub id, create a promise to get the data
        subscriptionsFromDB.forEach(sub =>
        {
            requestPromises.push(this.httpService.get(`https://api.themoviedb.org/3/tv/${sub.tmdbId}?api_key=${this.config.tmdbApiKey}&append_to_response=videos,external_ids`).toPromise());
            // requestPromises.push(this.httpService.get(`https://api.themoviedb.org/3/tv/${sub.tmdbId}/videos?api_key=${this.config.tmdbApiKey}`).toPromise());
            // requestPromises.push(this.httpService.get(this.config.tvdbSeriesUri + `/${sub.tvdbId}`, tvdbConfig).toPromise())
        });

        // execute batch promises to get TV data from TMDB API
        let data = await Promise.all(requestPromises);

        // clear request promises to reuse it later
        requestPromises = [];

        // populate subscriptionsToSend with data retrieved from tmdb
        data.forEach(responseData =>
        {
            // append sub object to send back (we still dont have air times yet)
            const subscriptionToSend: SubscriptionResponse = {};
            subscriptionToSend.name = responseData.data.name;
            subscriptionToSend.summary = responseData.data.summary;
            subscriptionToSend.network = responseData.data.network;
            subscriptionToSend.poster_path = responseData.data.poster_path;
            subscriptionToSend.vote_average = responseData.data.vote_average;
            subscriptionToSend.episode_run_time = responseData.data.episode_run_time;
            subscriptionToSend.genres = responseData.data.genres;
            subscriptionToSend.videos = responseData.data.videos;
            subscriptionToSend.external_ids = responseData.data.external_ids;
            subscriptionsToSend.push(subscriptionToSend)

            // add promise for the request to tvdb api so we can get air times
            const tvdbRequestConfig: AxiosRequestConfig = { headers: { Authorization: "Bearer " + this.config.tvdbJwtToken } };
            requestPromises.push(this.httpService.get(this.config.tvdbSeriesUri + `/${subscriptionToSend.external_ids.tvdb_id}`, tvdbRequestConfig).toPromise());

        });

        // execute batch promises to get airTimes data from TVDB API
        data = await Promise.all(requestPromises);

        // edit subscriptionsToSend with data retrieved from tvdb
        data.forEach(responseData =>
        {
            // const subscriptionIndex: number = subscriptionsToSend.findIndex(i => i.external_ids.tvdb_id === sub.data.data.id);

            // find subscription that matches with the tvdb ID
            const subscription: SubscriptionResponse = subscriptionsToSend.find(i => i.external_ids.tvdb_id === responseData.data.data.id);

            // this object is a refrence so we can edit it directly
            subscription.airsDayOfWeek = responseData.data.data.airsDayOfWeek;
            subscription.airsTime = responseData.data.data.airsTime;
        });
        
        return { statusCode: 201, data: subscriptionsToSend };
    }
}
