import { Injectable, NotFoundException, ConflictException, HttpService } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Subscription, TvShowModel } from '../interfaces/subscription.interface';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/auth/interfaces/user.interface';
import { UserService } from 'src/auth/services/user.service';
import { Observable } from 'rxjs';
import { AxiosResponse, AxiosRequestConfig } from 'axios';
import { ConfigService } from 'src/config.service';
import { TmdbService } from './tmdb-service';
import { ObjectId, DeleteWriteOpResultObject } from 'mongodb';


@Injectable()
export class SubscriptionsService 
{
    constructor(
        @InjectModel('Subscription')
        private readonly subscriptionModel: Model<Subscription>,
        private readonly tmdbService: TmdbService)
    { }

    async addSubscription(_userId: string, tmdbId: number): Promise<Subscription>
    {
        // try to find sub
        const subExists: Subscription = await this.getSubscription(_userId, tmdbId)

        // if we dont find one, add the new sub
        if (!subExists)
        {
            const newSubscription: Subscription = new this.subscriptionModel({ _userId: Types.ObjectId(_userId), tmdbId });
            return await newSubscription.save();
        }
        // if we find one, throw exception
        else
        {
            throw new ConflictException("Subscription already exists for this user.");
        }
    }

    async deleteSubscription(_userId: string, tmdbId: number): Promise<DeleteWriteOpResultObject['result']>
    {
        const result: { ok?: number; n?: number; deletedCount?: number } = await this.subscriptionModel.deleteOne({ _userId, tmdbId }).exec();

        if (result.deletedCount == 1)
        {
            return result;
        }
        else
        {
            throw new NotFoundException("Susbcription was not found.");
        }
    }

    async getSubscription(_userId: string, tmdbId: number): Promise<Subscription> 
    {
        return await this.subscriptionModel.findOne({ _userId, tmdbId });
    }

    async getAllSubscriptions(_userId: string): Promise<TvShowModel[]>
    {
        // get all sub ids from DB
        const subscriptionsFromDB: Subscription[] = await this.subscriptionModel.find({ _userId });
        const subscriptionIDs: number[] = subscriptionsFromDB.map(sub => sub.tmdbId);

        if (subscriptionIDs.length > 0)
        {
            return await this.tmdbService.getShows(subscriptionIDs);
        }
        else
        {
            throw new NotFoundException("No subscriptions were found!");
        }
    }
}
