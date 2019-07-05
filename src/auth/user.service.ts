import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Mongoose, Schema } from 'mongoose';
import { User } from './interfaces/user.interface';
import { hash } from 'bcrypt';
import { RegisterResponse } from './dto/register.dto';
import { EmailVerificationToken } from './interfaces/email-verification-token.interface';
import { randomBytes } from 'crypto';
import { createTransport } from 'nodemailer';
import { emailPassword, emailVerificationEndPoint } from 'config';
const emailExistence = require('email-existence');

@Injectable()
export class UserService 
{
    constructor(@InjectModel('User') private readonly userModel: Model<User>,
        @InjectModel('EmailVerificationToken') private readonly emailVerificationTokenModel: Model<EmailVerificationToken>) { }

    async registerUser(email: string, password: string): Promise<RegisterResponse>
    {
        // check if email is even real
        if (!await this.doesEmailExist(email))
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
            this.sendVerificationEmail(newUser._id, newUser.email);

            isSuccess = true;
            messageToSend = `A new user was created and a verification email was sent to ${newUser.email}`;
        }
        // otherwise send another verification with user we found earlier
        else
        {   
            let emailSentMessage: string;

            // only sresend if user is not active
            if (!oldUser.isActive)
            {
                // include that the email was resent
                emailSentMessage = "Verification email was resent!";
                //send the email
                await this.sendVerificationEmail(oldUser._id, oldUser.email);
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

    async getToken(_userId: Schema.Types.ObjectId): Promise<EmailVerificationToken>
    {
        return await this.emailVerificationTokenModel.findOne({ _userId }).exec();
    }

    // this works fine except
    async sendVerificationEmail(_userId: Schema.Types.ObjectId, email: string)
    {
        let tokenToSend: EmailVerificationToken;

        //check if a token exists for given user
        let oldToken: EmailVerificationToken = await this.getToken(_userId);

        // if we already have a token for this user, then lets resend it in the email
        if (oldToken)
        {
            tokenToSend = oldToken;
        }
        // otherwise, make a new token and send that instead
        else
        {
            // generate random email verification token and save it
            tokenToSend = new this.emailVerificationTokenModel({ _userId: _userId, token: randomBytes(16).toString('hex') });
            await tokenToSend.save();
        }


        // setup email transporter
        let transporter = createTransport
            ({
                service: 'gmail',
                auth:
                {
                    user: 'twiglaser@gmail.com',
                    pass: emailPassword
                }
            });

        // transporter options
        let mailOptions =
        {
            from: 'twiglaser@gmail.com',
            to: email,
            subject: 'Please Verify Your Email with Tracker App',
            html: `<h3>Welcome to Tracker</h3>
            <p><a href="${emailVerificationEndPoint}?verification=${tokenToSend.token}&email=${email}">
                Please click here</a> to verify your email address.</p>`
        };

        //send the email
        let sentEmail = await transporter.sendMail(mailOptions);

    }

    // This function is just a wrapper around the email-existence package.
    // Checks to
    doesEmailExist(email: string): Promise<boolean>
    {
        return new Promise((resolve, reject) =>
        {
            emailExistence.check(email, function (response, error)
            {
                if (!email) reject(new Error('No email provided!'))

                resolve(error);
            });
        })

    }
}
