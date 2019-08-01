import { Module, HttpModule, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { TVShowModule } from './tvshow/tvshow.module';
import { AuthenticationMiddleware } from './auth/middleware/auth.middleware';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';

/**
 * Almost identical to the regular app module, except for the mongoDB Uri.
 * Used for e2e testing.
 */
@Module({
    imports: [AuthModule, TVShowModule, HttpModule,
        MongooseModule.forRoot('mongodb://localhost/appTest', { useNewUrlParser: true }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.jwtSecret,
            }),
            inject: [ConfigService],
        })],
    providers: []
})

export class AppTestModule implements NestModule
{
    configure(consumer: MiddlewareConsumer)
    {
        consumer.apply(AuthenticationMiddleware).forRoutes("/");
    }
}
