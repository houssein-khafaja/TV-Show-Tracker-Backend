import { UserService } from '../auth/user.service';
import { AuthController } from '../auth/auth.controller';
import { Model } from 'mongoose';
import { User } from 'src/auth/interfaces/User.interface';
import { Test } from '@nestjs/testing';
import { RegisterResponse } from 'src/auth/dto/register.dto';
import { UserSchema } from '../auth/schemas/user.schema'
import { INestApplication } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module'
import * as request from 'supertest';

describe('Register Test', () =>
{
    let app: INestApplication;
    let authService = { register: () => { email: "test" } };

    beforeAll(async () =>
    {
        const module = await Test.createTestingModule({
            imports: [AuthModule],
        })
            .overrideProvider(UserService)
            .useValue(authService)
            .compile();

        app = module.createNestApplication();
        await app.init();
    });

    it(`/auth/register`, () =>
    {
        return request(app.getHttpServer())
            .post('/auth/register')
            .expect(200)
            .expect({
                data: authService.register(),
            });
    });

    afterAll(async () =>
    {
        await app.close();
    });
});