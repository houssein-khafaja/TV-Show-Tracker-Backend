import { Document, Schema } from "mongoose";

export interface Subscription extends Document
{
    _userId: Schema.Types.ObjectId,
    tmdbId: number
}

export interface SubscriptionResponse
{
    name?: string,
    summary?: string,
    airsDayOfWeek?: string,
    airsTime?: string,
    network?: string,
    poster_path?: string | null,
    vote_average?: number,
    episode_run_time?: number[],
    genres?: { id: number, name: string },
    videos?: {}[],
    external_ids?: { tvdb_id: number },
    tmdbId?: string // used as an index for search purposes
}