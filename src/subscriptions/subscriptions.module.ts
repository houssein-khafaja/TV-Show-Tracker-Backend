import { Module, HttpModule } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { AuthModule } from 'src/auth/auth.module';
import { SubscriptionsService } from './services/subscriptions.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionSchema } from './schemas/subscription.schema'
import { UserSchema } from 'src/auth/schemas/user.schema';
import { JwtService, JwtModule } from '@nestjs/jwt';
import { AuthService } from 'src/auth/services/auth.service';
import { ConfigService } from 'src/config.service';
import { ConfigModule } from 'src/config.module';
import { TvdbJwtService } from './services/tvdb-jwt.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }, { name: 'Subscription', schema: SubscriptionSchema }]),
        AuthModule,
        HttpModule],
    controllers: [SubscriptionsController],
    providers: [SubscriptionsService, TvdbJwtService],
    exports: [TvdbJwtService],
})
export class SubscriptionsModule { }
