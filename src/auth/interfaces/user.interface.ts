import { Document, Schema } from "mongoose";

export interface User extends Document
{
    email: string,
    password: string
    isActive: boolean
}