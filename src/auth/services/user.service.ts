import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../interfaces/user.interface';
import { hash } from 'bcrypt';
import { SentMessageInfo } from 'nodemailer';
import { EmailVerificationService } from './email-verification.service';
import { DeleteWriteOpResultObject } from 'mongodb';

@Injectable()
export class UserService 
{
    constructor(
        @InjectModel('User') 
        private readonly userModel: Model<User>,
        private readonly emailVerificationService: EmailVerificationService)
    { }

    async registerUser(email: string, password: string): Promise<SentMessageInfo>
    {
        // check if email is even real
        if (!await this.emailVerificationService.doesEmailExist(email))
        {
            // its not real so lets tell the user
            throw new NotFoundException(`The email: ${email} does not exist! Please provide a real email to verify your account.`)
        }

        // Salt = 10, makes hashing take about 13 seconds to finish
        password = await hash(password, 10);

        // check if user already exists
        const oldUser: User = await this.getUser(email, false);

        // if they dont exist, then proceed to register
        if (!oldUser)
        {
            // register the user
            const newUser: User = new this.userModel({ email, password })
            const registeredUser: User = await newUser.save();
            
            //send the email
            return this.emailVerificationService.sendVerificationEmail(registeredUser.email, registeredUser._id);
        }
        // otherwise send another verification with user we found earlier
        else
        {
            // only resend if user is not active
            if (!oldUser.isActive)
            {
                // resend the email
                return await this.emailVerificationService.sendVerificationEmail(oldUser.email, oldUser._id);
            }
            // else the user exists and already active
            else
            {
                throw new UnprocessableEntityException("User already exists and is verified.");
            }
        }
    }

    async getUser(email: string, throwException: boolean = true): Promise<User>
    {
        const result: User = await this.userModel.findOne({ email }).exec();
        
        // if we dont want to throw an excpetions, then return result regardles if a user was found
        if (result || !throwException)
        {
            return result;
        }
        else
        {
            throw new NotFoundException("User was not found!");
        }
    }
}