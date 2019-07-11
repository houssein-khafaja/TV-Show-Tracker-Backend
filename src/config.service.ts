import * as dotenv from 'dotenv';
import * as Joi from 'joi';
import * as fs from 'fs';
import { Injectable } from '@nestjs/common';

export interface EnvConfig
{
    [key: string]: string;
}

@Injectable()
export class ConfigService
{
    get emailVerificationUri(): string { return this.envConfig.EMAIL_VERIFICATION_URI; }
    get email(): string { return this.envConfig.EMAIL; }
    get emailPassword(): string { return this.envConfig.EMAIL_PASSWORD; }
    get jwtSecret(): string { return this.envConfig.JWT_SECRET; }
    get tmdbApiKey(): string { return this.envConfig.TMDB_API_KEY; }
    get tvdbApiKey(): string { return this.envConfig.TVDB_API_KEY; }
    get tvdbUsername(): string { return this.envConfig.TVDB_USERNAME; }
    get tvdbUserKey(): string { return this.envConfig.TVDB_USERKEY; }
    get tvdbLoginUri(): string { return this.envConfig.TVDB_LOGIN_URI; }
    get tvdbJwtToken(): string { return this.envConfig.TVDB_JWT_TOKEN; }
    set tvdbJwtToken(newToken: string) { this.envConfig.TVDB_JWT_TOKEN = newToken; }

    private readonly envConfig: EnvConfig;

    constructor(filePath: string)
    {
        const config = dotenv.parse(fs.readFileSync(filePath));
        this.envConfig = this.validateInput(config);
    }

    /**
     * Ensures all needed variables are set, and returns the validated JavaScript object
     * including the applied default values.
     */
    private validateInput(envConfig: EnvConfig): EnvConfig
    {
        const envVarsSchema: Joi.ObjectSchema = Joi.object({
            EMAIL_VERIFICATION_URI: Joi.string().default(''),
            EMAIL: Joi.string().default(''),
            EMAIL_PASSWORD: Joi.string().default(''),
            JWT_SECRET: Joi.string().default(''),
            TMDB_API_KEY: Joi.string().default(''),
            TVDB_API_KEY: Joi.string().default(''),
            TVDB_USERNAME: Joi.string().default(''),
            TVDB_USERKEY: Joi.string().default(''),
            TVDB_LOGIN_URI: Joi.string().default(''),
            TVDB_JWT_TOKEN: Joi.string().default('asd')
        });

        const { error, value: validatedEnvConfig } = Joi.validate(envConfig, envVarsSchema);

        if (error)
        {
            throw new Error(`Config validation error: ${error.message}`);
        }

        return validatedEnvConfig;
    }
}