import { Document, Schema, Types } from "mongoose";

export interface Subscription extends Document
{
    _userId: Types.ObjectId,
    tmdbID: number
}

export interface TvShowModel
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
    genres: { id: number, name: string }[],
    videos: {}[],
    external_ids: { tvdb_id: number },
    tmdbID: string // used as an index for search purposes
}

export interface MinifiedShowModel
{
    name: string,
    overview: string,
    poster_path: string,
    vote_average: number,
    vote_count: number,
    genres: { id: number, name: string }[],
    tmdbID: number,
}