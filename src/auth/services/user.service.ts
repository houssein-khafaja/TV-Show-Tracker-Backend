import { Injectable, Inject, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Mongoose, Schema } from 'mongoose';
import { User } from '../interfaces/user.interface';
import { hash } from 'bcrypt';
import { RegisterResponse } from '../dto/register.dto';
import { EmailVerificationToken } from '../interfaces/email-verification-token.interface';
import { randomBytes } from 'crypto';
import { createTransport } from 'nodemailer';
import { EmailVerificationService } from './email-verification.service';
const emailExistence = require('email-existence');

@Injectable()
export class UserService 
{
    constructor(
        @InjectModel('User') 
        private readonly userModel: Model<User>,
        private readonly emailVerificationService: EmailVerificationService)
    { }

    async registerUser(email: string, password: string): Promise<{}>
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

        // for response object
        let code: number = 201;
        let messageToSend: string;

        // if they dont exist, then proceed to register
        if (!oldUser)
        {
            // register the user
            const newUser: User = new this.userModel({ email, password })
            const registeredUser: User = await newUser.save();

            //send the email
            let emailSendResponse = this.emailVerificationService.sendVerificationEmail(registeredUser._id, registeredUser.email);

            console.log(emailSendResponse);
            

            messageToSend = `A new user was created and a verification email was sent to ${registeredUser.email}`;
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

            code = 209;
            messageToSend = `The provided email is already in use! ${emailSentMessage}`;
        }

        return { statusCode: code, message: messageToSend }
    }

    // mainly for cleaning up after testing
    async deleteUser(email: string): Promise<{}>
    {
        const result: { ok?: number; n?: number; deletedCount?: number } = await this.userModel.deleteOne({ email }).exec();

        if (result.deletedCount == 1)
        {
            return { statusCode: 201, message: "User deleted" };
        }
        else
        {
            throw new NotFoundException("User was NOT deleted");
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

    // // testing email verification is
    // async verifyBackdoor(email: string)
    // {
    //     let user: User = await this.getUser(email);
    //     user.isActive = true
    // }
}
