import { Module, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthController } from './auth.controller';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import { EmailVerificationTokenSchema } from './schemas/email-verification-token.schema';
import { Model } from 'mongoose';
import { User } from './interfaces/user.interface';

let userModel: Model<User>;
@Module({
    imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }, {name: "EmailVerificationToken", schema: EmailVerificationTokenSchema}])],
    controllers: [AuthController],
    providers: [UserService] // , { provide: getModelToken('User'), useValue: userModel }
})
export class AuthModule { }
