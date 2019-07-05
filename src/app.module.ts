import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';

@Module({
    imports: [AuthModule, MongooseModule.forRoot('mongodb://localhost/passport', { useNewUrlParser: true }),]
})
export class AppModule { }
