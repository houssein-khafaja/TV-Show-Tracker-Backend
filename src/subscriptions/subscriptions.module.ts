import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { AuthModule } from 'src/auth/auth.module';
import { SubscriptionsService } from './subscriptions.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionSchema } from './schemas/subscription.schema'
import { UserSchema } from 'src/auth/schemas/user.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }, { name: 'Subscription', schema: SubscriptionSchema }]),
        AuthModule],
    controllers: [SubscriptionsController],
    providers: [SubscriptionsService],
    exports: [],
})
export class SubscriptionsModule { }
