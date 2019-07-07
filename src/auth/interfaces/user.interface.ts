import { Document, Schema } from "mongoose";

// this is for a regular object that we could send back as a response
export interface PublicUser
{
    email: string,
    isActive: boolean
}

export interface User extends Document, PublicUser
{
    password: string
}