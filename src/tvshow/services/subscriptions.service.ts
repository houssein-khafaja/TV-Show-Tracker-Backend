import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Subscription, TvShowModel } from '../interfaces/subscription.interface';
import { TmdbService } from './tmdb.service';
import { DeleteWriteOpResultObject } from 'mongodb';


@Injectable()
export class SubscriptionsService 
{
    constructor(
        @InjectModel('Subscription')
        private readonly subscriptionModel: Model<Subscription>,
        private readonly tmdbService: TmdbService)
    { }

    async addSubscription(_userId: number, tmdbID: number): Promise<Subscription>
    {
        // try to find sub
        const subExists: Subscription = await this.getSubscription(_userId, tmdbID);

        // if we dont find one, add the new sub
        if (!subExists)
        {
            const newSubscription: Subscription = new this.subscriptionModel({ _userId, tmdbID });
            return await newSubscription.save();
        }
        // if we find one, throw exception
        else
        {
            throw new ConflictException("Subscription already exists for this user.");
        }
    }

    async deleteSubscription(_userId: number, tmdbID: number): Promise<boolean>
    {
        const result: { ok?: number; n?: number; deletedCount?: number } = await this.subscriptionModel.deleteOne({ _userId, tmdbID }).exec();

        if (result.deletedCount == 1)
        {
            return true;
        }
        else
        {
            throw new NotFoundException("Susbcription was not found.");
        }
    }

    async getSubscription(_userId: number, tmdbID: number): Promise<Subscription> 
    {
        return await this.subscriptionModel.findOne({ _userId, tmdbID });
    }

    async getAllSubscriptions(_userId: number): Promise<TvShowModel[]>
    {
        // get all sub ids from DB
        const subscriptionsFromDB: Subscription[] = await this.subscriptionModel.find({ _userId });
        const subscriptionIDs: number[] = subscriptionsFromDB.map(sub => sub.tmdbID);

        if (subscriptionIDs.length == 0)
        {
            // Its not really an error if we dont find anything, so we shouldnt throw one
            // instead lets return empty, and let the controller handle it
            return [];
        }
        else
        {
            return await this.tmdbService.getShows(subscriptionIDs);
        }
    }
}
