import { Document, Schema, Types } from "mongoose";

// used for mongoDB Subscription records
export interface Subscription extends Document
{
    _userId: number,
    tmdbID: number
}

// used for sending back TV Show data
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

// When we query for a list of shows, we get a different model for each returned show.
// This interface reflects those changes. I also decided that since I'm not getting all
// of the info anyway, might as well not worry about getting the air times from TVDB 
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