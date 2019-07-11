import { Injectable, NotFoundException, ConflictException, HttpService } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription } from './interfaces/subscription.interface';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/auth/interfaces/user.interface';
import { UserService } from 'src/auth/services/user.service';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { ConfigService } from 'src/config.service';


@Injectable()
export class SubscriptionsService 
{
    constructor(@InjectModel('Subscription') private readonly subscriptionModel: Model<Subscription>,
        private readonly userService: UserService,
        private readonly httpService: HttpService,
        private readonly config: ConfigService) { }

    async addSubscription(_userId: string, tmdbId: number, tvdbId: number): Promise<Subscription>
    {
        // try to find sub
        let subExists: Subscription = await this.getSubscription(_userId, tmdbId, tvdbId)

        // if we dont find one, add the new sub
        if (!subExists)
        {
            let newSubscription: Subscription = new this.subscriptionModel({ _userId, tmdbId, tvdbId });
            return await newSubscription.save();
        }
        // if we find one, throw exception
        else
        {
            throw new ConflictException("Subscription already exists for this user.");
        }
    }

    async deleteSubscription(_userId: string, tmdbId: number, tvdbId: number): Promise<{}>
    {   
        let result: { ok?: number; n?: number; deletedCount?: number } = await this.subscriptionModel.deleteOne({ _userId, tmdbId, tvdbId }).exec();

        if (result.deletedCount == 1)
        {
            return { statusCode: 201, message: "Subscription deleted" };
        }
        else
        {
            throw new NotFoundException("Susbcription was not found.");
        }
    }

    async getSubscription(_userId: string, tmdbId: number, tvdbId: number): Promise<Subscription> | null
    {
        return await this.subscriptionModel.findOne({ _userId, tmdbId, tvdbId });
    }

    async getAllSubscriptions(_userId: string)
    {
        // we need to make a batch  of requests to TMDB and TVDB, so we will save them as promises
        let tmdbRequestPromises: Promise<any>[] = [];
        let tvdbRequestPromises: Promise<any>[] = [];

        // get all sub ids from DB
        let subscriptions: Subscription[] = await this.subscriptionModel.find({ _userId });

        // for each id, create a promise
        subscriptions.forEach(sub =>
        {
            tmdbRequestPromises.push(this.httpService.get(`https://api.themoviedb.org/3/tv/${sub.tmdbId}?api_key=${this.config.tmdbApiKey }`).toPromise());
            // tmdbRequestPromises.push(this.httpService.get(`https://api.themoviedb.org/3/tv/${sub.tmdbId}?api_key=${apiKeyV3}`).toPromise());
        });

        // execute batch promises to get TV data from TMDB API
        let tmdbData = await Promise.all(tmdbRequestPromises);
        let tvdbData = await Promise.all(tvdbRequestPromises);

        // we need to simplify data objects to just the properties that we want to send back
        tmdbData.forEach(tvShow =>
        {
            /* get the following properties
                poster_path
                name
                networks
            */
        });

        return "this.httpService.get('https://api.themoviedb.org/3/movie/76341?api_key=2e46e1fc7caa513c60619c735c7d023b').toPromise()";
    }
}
