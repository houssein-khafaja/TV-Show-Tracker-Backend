import { Document, Schema } from "mongoose";

// represents a single email verification token from our DB
export interface EmailVerificationToken extends Document
{
    _userId: number,
    token: string,
    createdAt: Date
}