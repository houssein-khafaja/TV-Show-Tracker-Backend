import { Injectable, OnModuleInit, OnApplicationBootstrap, HttpService, BadRequestException } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

/**---------------------------------------------------------------------------------------------------------------
 * The purpose of this service is to manage the getting and refreshing of the TVDB JWT token.
 * ---------------------------------------------------------------------------------------------------------------*/
@Injectable()
export class TvdbJwtService implements OnApplicationBootstrap
{
    constructor(
        private readonly config: ConfigService,
        private readonly httpService: HttpService)
    { }

    // on startup get our token
    async onApplicationBootstrap()
    {
        await this.getNewTvdbJwtToken();
    }

    /**
     * When the server first starts, we want to get a new fresh JWT token since they only last 24 hours.
     * This method will hit their API to get a new one and store it in our config object.
     * @throws BadRequestException when it doesnt work
     * @returns true if it works
     */
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

    /**
     * This method refreshes our TVDB jwt token.
     * 
     * Since the TVDB jwt token only lasts 24 hours, we need to refresh it as often as we can.
     * We could spin a new thread and have a loop that iterates every 23 hours or so to run this method,
     * but NestJS prefers to handle multithreading via apps like Docker. So for now, I will simply make this 
     * method available and have it run whenever a request arrives to the server via middleware.
     * I dont like this idea since the server will stop working properly if it doesnt receive a request within 24 hours.
     * I might come up with a different solution later.
     */
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