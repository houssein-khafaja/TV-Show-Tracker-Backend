import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Mongoose, Schema } from 'mongoose';
import { User } from '../interfaces/user.interface';
import { hash } from 'bcrypt';
import { RegisterResponse } from '../dto/register.dto';
import { EmailVerificationToken } from '../interfaces/email-verification-token.interface';
import { randomBytes } from 'crypto';
import { createTransport } from 'nodemailer';
import { emailPassword, emailVerificationEndPoint } from 'config';
const emailExistence = require('email-existence');

@Injectable()
export class EmailVerificationService 
{
    constructor(@InjectModel('User') private readonly userModel: Model<User>,
                @InjectModel('EmailVerificationToken') private readonly emailVerificationTokenModel: Model<EmailVerificationToken>) { }

    async getEmailVerificationToken(_userId: Schema.Types.ObjectId): Promise<EmailVerificationToken>
    {
        return await this.emailVerificationTokenModel.findOne({ _userId }).exec();
    }

    // this works fine except
    async sendVerificationEmail(_userId: Schema.Types.ObjectId, email: string)
    {
        let tokenToSend: EmailVerificationToken;

        //check if a token exists for given user
        let oldToken: EmailVerificationToken = await this.getEmailVerificationToken(_userId);

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
    // Checks to see if your email actually exists at given domain
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
