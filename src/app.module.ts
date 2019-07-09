import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';

@Module({
    imports: [AuthModule, SubscriptionsModule,
             MongooseModule.forRoot('mongodb://localhost/passport', { useNewUrlParser: true })],
    providers: []
})
export class AppModule { }
