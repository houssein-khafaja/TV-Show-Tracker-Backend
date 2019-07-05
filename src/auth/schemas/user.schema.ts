import * as mongoose from 'mongoose';
import { User } from '../interfaces/User.interface';

export const UserSchema: mongoose.Schema<User> = new mongoose.Schema
({
    email: 
    {
        type: String,
        index: true,
        unique: true,
        dropDups: true,
        required: true,
    },
    password: 
    { //salted and hashed using bcrypt
        type: String,
        required: true,
    },
    isActive:
    {
        type: Boolean,
        required: true,
        default: false
    }
});