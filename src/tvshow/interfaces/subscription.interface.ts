import { Document, Schema } from "mongoose";

export interface Subscription extends Document
{
    _userId: Schema.Types.ObjectId,
    tmdbId: number
}

export interface SubscriptionResponseModel
{
    name: string,
    overview: string,
    airsDayOfWeek?: string,
    airsTime?: string,
    network: string,
    poster_path: string | null,
    vote_average: number,
    vote_count: number,
    episode_run_time: number[],
    genres: { id: number, name: string },
    videos: {}[],
    external_ids: { tvdb_id: number },
    tmdbId: string // used as an index for search purposes
}

export interface PopularShowModel
{
    tmdbId: number,
    name: string,
    overview: string,
    poster_path: string,
    vote_average: number,
    vote_count: number,
    genres: { id: number, name: string }[],
}