import { Module, HttpModule } from '@nestjs/common';
import { SubscriptionsController } from './controllers/subscriptions.controller';
import { AuthModule } from '../auth/auth.module';
import { SubscriptionsService } from './services/subscriptions.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionSchema } from './schemas/subscription.schema'
import { UserSchema } from '../auth/schemas/user.schema';
import { TvdbJwtService } from './services/tvdb-jwt.service';
import { TvShowController } from './controllers/tvshow.controller';
import { TmdbService } from './services/tmdb.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }, { name: 'Subscription', schema: SubscriptionSchema }]),
        AuthModule,
        HttpModule],
    controllers: [SubscriptionsController, TvShowController],
    providers: [SubscriptionsService, TvdbJwtService, TmdbService],
    exports: [TvdbJwtService],
})
export class TVShowModule { }
