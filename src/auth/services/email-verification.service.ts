import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema } from 'mongoose';
import { EmailVerificationToken } from '../interfaces/email-verification-token.interface';
import { randomBytes } from 'crypto';
import { createTransport, SentMessageInfo } from 'nodemailer';
import { ConfigService } from '../../config.service';
var emailCheck = require('email-check');

/**---------------------------------------------------------------------------------------------------------------
 * This service is responsible for handling DB interactions regarding email verification tokens,
 * sending email verification emails and checking the existance of emails.
 *---------------------------------------------------------------------------------------------------------------*/
@Injectable()
export class EmailVerificationService 
{
    constructor(
        @InjectModel('EmailVerificationToken')
        private readonly emailVerificationTokenModel: Model<EmailVerificationToken | null>,
        private readonly config: ConfigService)
    { }

    /**
     * Searches the DB for a verification token with the user's ID.
     * @param _userId unique ID of the user
     * @returns an email verification token, or null if one is not found.
     */
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

    /**
     * Sends a verification email to the user. If a token alrady exists in the DB, then that token
     * will be reused. So no user will have more than one token assigned to them.
     * @param email user email
     * @param _userId unique ID of the user
     * @throws ServiceUnavailableException when the user fails to receive the email
     * @returns the email address that received the email
     */
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
        let sentEmailInfo = await transporter.sendMail(mailOptions);

        // did the user accept the email?
        if (sentEmailInfo.accepted.length > 0)
        {
            // .envelope.to is an array of emails in the "to:" list, should only be one in there
            return (sentEmailInfo.envelope.to[0]);
        }
        else
        {
            // else the email didnt get to the user for some reason
            throw new ServiceUnavailableException("Verification email was not accepted by the end destination (user's email address).")
        }
    }

    /**
     *  This function is just an async wrapper around the email-check package. 
     * Checks to see if your email actually exists in the world.
     * @param email user email
     * @returns a boolean representing whether the email exists
     */
    async doesEmailExist(email: string): Promise<boolean>
    {
        return emailCheck(email).then(function (res)
        {
            return res; // this is a boolean value

        }).catch(function (err)
        {
            return false;
        });
    }
}
