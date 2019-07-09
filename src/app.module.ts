import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { Subscriptions } from './subscriptions';

@Module({
    imports: [AuthModule, MongooseModule.forRoot('mongodb://localhost/passport', { useNewUrlParser: true }), SubscriptionsModule,],
    providers: [Subscriptions]
})
export class AppModule { }
