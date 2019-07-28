import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema } from 'mongoose';
import { EmailVerificationToken } from '../interfaces/email-verification-token.interface';
import { randomBytes } from 'crypto';
import { createTransport, SentMessageInfo } from 'nodemailer';
import { ConfigService } from '../../config.service';
var emailCheck = require('email-check');

@Injectable()
export class EmailVerificationService 
{
    constructor(
        @InjectModel('EmailVerificationToken')
        private readonly emailVerificationTokenModel: Model<EmailVerificationToken | null>,
        private readonly config: ConfigService)
    { }

    async getEmailVerificationToken(_userId: number): Promise<EmailVerificationToken>
    {
        const result: EmailVerificationToken = await this.emailVerificationTokenModel.findOne({ _userId }).exec();

        if (result)
        {
            return result;
        }
        else
        {
            return null;
        }

    }

    async sendVerificationEmail(email: string, _userId: number): Promise<SentMessageInfo>
    {
        let tokenToSend: EmailVerificationToken;

        //check if a token exists for given user
        const oldToken: EmailVerificationToken = await this.getEmailVerificationToken(_userId);

        // if we already have a token for this user, then lets resend it in the email
        if (oldToken)
        {
            tokenToSend = oldToken;
        }
        // otherwise, make a new token and send that instead
        else
        {
            // generate random email verification token and save it
            tokenToSend = new this.emailVerificationTokenModel({ _userId, token: randomBytes(16).toString('hex') });
            await tokenToSend.save();
        }

        // setup email transporter
        const transporter = createTransport
            ({
                service: 'gmail',
                auth:
                {
                    user: this.config.email,
                    pass: this.config.emailPassword
                }
            });

        // transporter options
        const mailOptions =
        {
            from: this.config.email,
            to: email,
            subject: 'Please Verify Your Email with Tracker App',
            html: `<h3>Welcome to Tracker</h3>
            <p><a href="${this.config.emailVerificationUri}?verification=${tokenToSend.token}&email=${email}">
                Please click here</a> to verify your email address.</p>`
        };

        // send the email, return response
        return await transporter.sendMail(mailOptions);
    }

    // This function is just an async wrapper around the email-check package.
    // Checks to see if your email actually exists at given domain and returns a promise.
    async doesEmailExist(email: string): Promise<boolean>
    {
        return emailCheck(email).then(function (res)
        {
            return res;

        }).catch(function (err)
        {
            return false;
        });
    }
}
