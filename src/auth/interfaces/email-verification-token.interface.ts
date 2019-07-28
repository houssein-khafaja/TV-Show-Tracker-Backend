import { Document, Schema } from "mongoose";

export interface EmailVerificationToken extends Document
{
    _userId: number,
    token: string,
    createdAt: Date
}