import { Injectable, OnModuleInit, OnApplicationBootstrap, HttpService, BadRequestException } from '@nestjs/common';
import { ConfigService } from '../../config.service';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

@Injectable()
export class TvdbJwtService implements OnApplicationBootstrap
{
    constructor(private readonly config: ConfigService,
        private readonly httpService: HttpService) { }

    // use api credentials to get our 24hour JWt token
    async onApplicationBootstrap()
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
        if (response.data.token)
        {
            console.log("jwt token for tvadb recieved");
            
            this.config.tvdbJwtToken = response.data.token;
        }
        else
        {
            throw new BadRequestException("Couldnt get JWT token from TVDB api")
        }
    }

    async refreshTvdbJwtToken()
    {
        const config: AxiosRequestConfig = { headers: { Authorization: "Bearer " + this.config.tvdbJwtToken } }
        const response:AxiosResponse = await this.httpService.get(this.config.tvdbRefreshUri, config).toPromise();
        
        if(response.data.token)
        {
            this.config.tvdbJwtToken = response.data.token;
        }
        else
        {
            throw new BadRequestException("Couldnt refresh JWT token from TVDB api")
        }

    }
}