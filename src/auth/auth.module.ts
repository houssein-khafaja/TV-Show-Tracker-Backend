import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { AuthController } from './controllers/auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import { EmailVerificationTokenSchema } from './schemas/email-verification-token.schema';
import { Model } from 'mongoose';
import { User } from './interfaces/user.interface';
import { AuthService } from './services/auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { EmailVerificationService } from './services/email-verification.service';
import { ConfigService } from '../config/config.service'
import { ConfigModule } from '../config/config.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }, { name: "EmailVerificationToken", schema: EmailVerificationTokenSchema }]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.jwtSecret,
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, EmailVerificationService, UserService],
    exports: [PassportModule, AuthService, UserService],
})
export class AuthModule { }
