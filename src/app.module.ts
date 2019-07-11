import { Module, HttpService, HttpModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { BootstrapService } from './bootstrap.service';

@Module({
    imports: [AuthModule, SubscriptionsModule, HttpModule,
             MongooseModule.forRoot('mongodb://localhost/passport', { useNewUrlParser: true })],
    providers: [BootstrapService]
})
export class AppModule { }
