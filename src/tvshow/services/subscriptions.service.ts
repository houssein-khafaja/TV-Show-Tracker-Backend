import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Subscription, TvShowModel } from '../interfaces/subscription.interface';
import { TmdbService } from './tmdb.service';
import { DeleteWriteOpResultObject } from 'mongodb';

/**---------------------------------------------------------------------------------------------------------------
 * This service is responsible for managing the subscriptions in the DB.
 * A susbcription is just a show that a user has chosen to "track".
 * ---------------------------------------------------------------------------------------------------------------*/
@Injectable()
export class SubscriptionsService 
{
    constructor(
        @InjectModel('Subscription')
        private readonly subscriptionModel: Model<Subscription>,
        private readonly tmdbService: TmdbService)
    { }

    /**
     * This method will create and store a new subscription record in our mongoDB.
     * The subscription will NOT be added if it already exists for that user.
     * @param _userId user's ID
     * @param tmdbID id of the show to be added
     * @throws ConflictException if the subscription already exists for the user
     * @returns the added subscription
     */
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

    /**
     * Deletes show subscription from mongoDB
     * @param _userId user's ID
     * @param tmdbID id of the show to delete
     * @returns a boolean representing whether the deletion was successful 
     */
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

    /**
     * Retrieves a single subcription belonging to a user.
     * This is not used by our controllers. It's main purpose is to check if a user exists.
     * @param _userId user's ID
     * @param tmdbID id of the show to get
     * @returns the user's subscription (or null if it doesnt exist)
     */
    async getSubscription(_userId: number, tmdbID: number): Promise<Subscription> 
    {
        return await this.subscriptionModel.findOne({ _userId, tmdbID });
    }

    /**
     * Gets all subscriptions belonging to a user. First we get the array of subcriptions and map
     * it to an array of show ID's. Then we call getShows() from TMDB service to get an array of shows
     * via the array of show ID's.
     * @param _userId user's ID
     * @returns an array of TV shows that the user is subscribed to. Will return an empty array if there are none.
     */
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
