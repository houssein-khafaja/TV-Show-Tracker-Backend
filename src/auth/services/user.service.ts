import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Mongoose, Schema } from 'mongoose';
import { User } from '../interfaces/user.interface';
import { hash } from 'bcrypt';
import { RegisterResponse } from '../dto/register.dto';
import { EmailVerificationToken } from '../interfaces/email-verification-token.interface';
import { randomBytes } from 'crypto';
import { createTransport } from 'nodemailer';
import { emailPassword, emailVerificationEndPoint } from 'config';
import { EmailVerificationService } from './email-verification.service';
const emailExistence = require('email-existence');

@Injectable()
export class UserService 
{
    constructor(@InjectModel('User') private readonly userModel: Model<User>,
        @Inject('EmailVerificationService') private readonly emailVerificationService: EmailVerificationService) { }

    async registerUser(email: string, password: string): Promise<RegisterResponse>
    {
        // check if email is even real
        if (!await this.emailVerificationService.doesEmailExist(email))
        {
            console.log("init");

            // its not real so lets tell the user
            return { email, message: "The email you provided is not available!", isSuccess: false }
        }


        // Salt = 10, makes hashing take about 13 seconds to finish
        password = await hash(password, 10);

        // check if user already exists
        let oldUser: User = await this.getUser(email);
        let messageToSend: string;
        let isSuccess: boolean;

        // if they dont exist, then proceed to register
        if (!oldUser)
        {
            // register the user
            const registeredUser: User = new this.userModel({ email, password })
            let newUser: User = await registeredUser.save();

            //send the email
            this.emailVerificationService.sendVerificationEmail(newUser._id, newUser.email);

            isSuccess = true;
            messageToSend = `A new user was created and a verification email was sent to ${newUser.email}`;
        }
        // otherwise send another verification with user we found earlier
        else
        {   
            let emailSentMessage: string = "";

            // only sresend if user is not active
            if (!oldUser.isActive)
            {
                // include that the email was resent
                emailSentMessage = "Verification email was resent!";
                //send the email
                await this.emailVerificationService.sendVerificationEmail(oldUser._id, oldUser.email);
            }

            isSuccess = false;
            messageToSend = `The provided email is already in use! ${emailSentMessage}`;
        }

        return { email, isSuccess, message: messageToSend }
    }

    // mainly for cleaning up after testing
    async deleteUser(email: string): Promise<string>
    {
        await this.userModel.findOne({ email }).remove().exec();
        return "User deleted";
    }

    async getUser(email: string): Promise<User>
    {
        return await this.userModel.findOne({ email }).exec();
    }
}
