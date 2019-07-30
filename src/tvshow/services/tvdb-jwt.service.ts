import { Injectable, OnModuleInit, OnApplicationBootstrap, HttpService, BadRequestException } from '@nestjs/common';
import { ConfigService } from '../../config.service';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

@Injectable()
export class TvdbJwtService implements OnApplicationBootstrap
{
    constructor(
        private readonly config: ConfigService,
        private readonly httpService: HttpService)
    { }

    // use api credentials to get our 24hour JWt token
    async onApplicationBootstrap()
    {
        await this.getNewTvdbJwtToken();
    }

    async getNewTvdbJwtToken(): Promise<boolean>
    {
        const body =
        {
            "apikey": this.config.tvdbApiKey,
            "userkey": this.config.tvdbUserKey,
            "username": this.config.tvdbUsername
        };

        // get the token
        const response = await this.httpService.post(this.config.tvdbLoginUri, body).toPromise();

        // check if we actually got the token
        if (response && response.data && response.data.token)
        {
            this.config.tvdbJwtToken = response.data.token;
            return true;
        }
        else
        {
            throw new BadRequestException("Couldnt get JWT token from TVDB api")
        }
    }

    async refreshTvdbJwtToken(): Promise<boolean>
    {
        const config: AxiosRequestConfig = { headers: { Authorization: "Bearer " + this.config.tvdbJwtToken } }
        const response: AxiosResponse = await this.httpService.get(this.config.tvdbRefreshUri, config).toPromise();

        if (response && response.data && response.data.token)
        {
            this.config.tvdbJwtToken = response.data.token;
            return true;
        }
        else
        {
            throw new BadRequestException("Couldnt refresh JWT token from TVDB api")
        }

    }
}