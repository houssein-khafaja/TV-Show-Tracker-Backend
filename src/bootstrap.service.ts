import { Injectable, OnModuleInit, OnApplicationBootstrap, HttpService, BadRequestException } from '@nestjs/common';
import { ConfigService } from './config.service';

@Injectable()
export class BootstrapService implements OnApplicationBootstrap
{
    constructor(private readonly config: ConfigService,
        private readonly httpService: HttpService) { }

    // use api credentials to get our 24hour JWt token
    async onApplicationBootstrap()
    {
        let body =
        {
            "apikey": this.config.tvdbApiKey,
            "userkey": this.config.tvdbUserKey,
            "username": this.config.tvdbUsername
        };

        let response = await this.httpService.post(this.config.tvdbLoginUri, body).toPromise();

        if (response.data.token)
        {
            this.config.tvdbJwtToken = response.data.token;
        }
        else
        {
            throw new BadRequestException("Couldnt get JWT token from TVDB api")
        }

    }
}