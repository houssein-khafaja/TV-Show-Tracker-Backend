import { Injectable, InternalServerErrorException, NotFoundException, NotAcceptableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Mongoose, Schema } from 'mongoose';
import { User } from '../interfaces/user.interface';
import { hash } from 'bcrypt';
import { RegisterResponse } from '../dto/register.dto';
import { EmailVerificationToken } from '../interfaces/email-verification-token.interface';
import { randomBytes } from 'crypto';
import { createTransport } from 'nodemailer';
import { ConfigService } from 'src/config.service';
import { UserService } from './user.service';
const emailExistence = require('email-existence');

@Injectable()
export class EmailVerificationService 
{
    constructor(@InjectModel('User') private readonly userModel: Model<User>,
        @InjectModel('EmailVerificationToken') private readonly emailVerificationTokenModel: Model<EmailVerificationToken>,
        private readonly config: ConfigService,
        private readonly userService: UserService) { }

    async getEmailVerificationToken(_userId: Schema.Types.ObjectId): Promise<EmailVerificationToken>
    {
        const result: EmailVerificationToken = await this.emailVerificationTokenModel.findOne({ _userId }).exec();

        if (result)
        {
            return result;
        }
        else
        {
            throw new NotFoundException("Email Verification Token was not found!")
        }

    }

    async sendVerificationEmail(_userId: Schema.Types.ObjectId, email: string)
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
            tokenToSend = new this.emailVerificationTokenModel({ _userId: _userId, token: randomBytes(16).toString('hex') });
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
            from: 'twiglaser@gmail.com',
            to: email,
            subject: 'Please Verify Your Email with Tracker App',
            html: `<h3>Welcome to Tracker</h3>
            <p><a href="${this.config.emailVerificationUri}?verification=${tokenToSend.token}&email=${email}">
                Please click here</a> to verify your email address.</p>`
        };

        //send the email
        const sentEmail = await transporter.sendMail(mailOptions);
        console.log(sentEmail);
        
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

    async verifyUser(email: string, verifyToken: string)
    {
        // find user
        const user: User = await this.userService.getUser(email);

        if (user.isActive)
        {
            // already verified
            throw new NotAcceptableException("Email is already verified!");
        }
        else
        {
            // not verified, lets try to verify it then!
            // does user have a verification token active?
            const tokenFound: EmailVerificationToken = await this.getEmailVerificationToken(user._id);

            if (tokenFound && tokenFound.token == verifyToken)
            {
                // tokens match, time to verify!
                user.isActive = true;
                const result: User = await user.save();

                if (result)
                {
                    return { statusCode: 201, message: "Email was successfully verified!" }

                }
                else
                {
                    throw new InternalServerErrorException("Email was NOT successfully verified!")
                }
            }
            else
            {
                // tokens didnt match or no token was found
                throw new NotFoundException("Email was NOT verified! Please re-register to resend the verification link.");
            }

        }
    }
}
