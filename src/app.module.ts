import { Module, HttpService, HttpModule, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { BootstrapService } from './bootstrap.service';
import { AuthenticationMiddleware } from './auth/middleware/auth.middleware';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from './config.module';
import { ConfigService } from './config.service';

@Module({
    imports: [AuthModule, SubscriptionsModule, HttpModule,
        MongooseModule.forRoot('mongodb://localhost/passport', { useNewUrlParser: true }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.jwtSecret,
            }),
            inject: [ConfigService],
        })],
    providers: [BootstrapService]
})

export class AppModule implements NestModule
{
    configure(consumer: MiddlewareConsumer)
    {
        consumer.apply(AuthenticationMiddleware).forRoutes("/");
    }
}
