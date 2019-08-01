import { Document, Schema } from "mongoose";

// represents a user record from our DB
export interface User extends Document
{
    email: string,
    password: string
    isActive: boolean
}