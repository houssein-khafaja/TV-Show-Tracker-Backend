import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import { EmailVerificationTokenSchema } from './schemas/email-verification-token.schema';
import { Model } from 'mongoose';
import { User } from './interfaces/user.interface';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { passportSecert } from 'config';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }, { name: "EmailVerificationToken", schema: EmailVerificationTokenSchema }]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
            secret: passportSecert,
            signOptions: {
                expiresIn: '360d',
            },
        }),
    ],
    controllers: [AuthController],
    providers: [UserService, AuthService, JwtStrategy], // , { provide: getModelToken('User'), useValue: userModel }
    exports: [PassportModule, AuthService],
})
export class AuthModule { }
