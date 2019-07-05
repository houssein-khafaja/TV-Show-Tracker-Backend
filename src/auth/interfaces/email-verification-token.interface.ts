import { Document, Schema } from "mongoose";

export interface EmailVerificationToken extends Document
{
    _userId: Schema.Types.ObjectId,
    token: string,
    createdAt: Date
}