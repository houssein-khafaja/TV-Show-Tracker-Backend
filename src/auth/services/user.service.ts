import { Injectable, NotFoundException, UnprocessableEntityException, ServiceUnavailableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../interfaces/user.interface';
import { hash } from 'bcrypt';
import { SentMessageInfo } from 'nodemailer';
import { EmailVerificationService } from './email-verification.service';
import { DeleteWriteOpResultObject } from 'mongodb';

/**---------------------------------------------------------------------------------------------------------------
 * This service handles User registration and retrieval.
 * Each method will be responsible for throwing exceptions when appropriate.
 * ---------------------------------------------------------------------------------------------------------------*/
@Injectable()
export class UserService 
{
    constructor(
        @InjectModel('User')
        private readonly userModel: Model<User>,
        private readonly emailVerificationService: EmailVerificationService)
    { }
    
    /**
     * Creates a new inactive user in our database and then sends a verification email.
     * If the user already exists and is still inactive, then it will only resend the 
     * verification email (user is not recreated).
     * @param email user email
     * @param password user password
     * @throws NotFoundException if the email provided does not exist in the universe
     * @throws UnprocessableEntityException if an active user already exists
     * @returns the email addressed that recieved the email
     */
    async registerUser(email: string, password: string): Promise<string>
    {
        // check if email is even real
        if (!await this.emailVerificationService.doesEmailExist(email))
        {
            // its not real so lets tell the user
            throw new NotFoundException(`The email: ${email} does not exist! Please provide a real email to verify your account.`)
        }

        // salt it, hash it, bake it
        password = await hash(password, 10);

        // check if user already exists
        const oldUser: User = await this.getUser(email, false);

        // if they dont exist, then proceed to register
        if (!oldUser)
        {
            // register the user
            const newUser: User = new this.userModel({ email, password })
            const registeredUser: User = await newUser.save();

            //send the email and return result
            return this.emailVerificationService.sendVerificationEmail(registeredUser.email, registeredUser._id);
        }
        // otherwise send another verification with user we found earlier
        else
        {
            // only resend if user is not active
            if (!oldUser.isActive)
            {
                // resend the email and return result
                return await this.emailVerificationService.sendVerificationEmail(oldUser.email, oldUser._id);
            }
            // else the user exists and already active
            else
            {
                throw new UnprocessableEntityException("User already exists and is verified.");
            }
        }
    }

    /**
     * Grabs the user from the database with the provided email. 
     * @param email user email
     * @param throwException signals whether this method should throw an exception if the user is not found,
     * or just return the result either way. Defaults to true.
     * @throws NotFoundException if user is not found and throwException is true.
     * @returns a user object if found, or null/undefined if user is not found and throwException is false.
     */
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