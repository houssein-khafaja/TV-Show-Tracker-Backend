import { Document, Schema } from "mongoose";

export interface Subscription extends Document
{
    _userId: Schema.Types.ObjectId,
    tmdbId: number,
    tvdbId: number
}