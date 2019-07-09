import * as mongoose from 'mongoose';

export const SubscriptionSchema = new mongoose.Schema({
    _userId: 
    { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        ref: 'User' 
    },
    showId: 
    { 
        type: Number, 
        required: true 
    }
});