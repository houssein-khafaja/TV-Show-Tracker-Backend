import { Controller, UseGuards, Get, Param, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TmdbService } from '../services/tmdb.service';
import { MinifiedShowModel, TvShowModel } from '../interfaces/subscription.interface';
import { ReturnPayload } from 'src/general-interface';
import { TvShowRequest, TvShowGetRequestParam } from '../dto/tvshow.dto';

/**---------------------------------------------------------------------------------------------------------------
 *  TvShow Controller
 *
 * The purpose of this controller is to handle the routes related to the interaction with  the TMDB database.
 * Each route handler is pretty simple. They will call the respective functions from a service,
 * then return the results as data. The route handler assumes that error checking and validation 
 * is handled by the injected services and class-validated classes, such as RegisterAndLoginRequest.
 *---------------------------------------------------------------------------------------------------------------*/
@Controller('tvshow')
@UseGuards(AuthGuard())
export class TvShowController 
{
    constructor(private readonly tmdbService: TmdbService) { }

    /**
     * Will call queryShows() from TMDB service to get a list of shows from TMDB database.
     * @param req the query params of the request from the client
     */
    @Get("query")
    async getPopularShows(@Query() req: TvShowRequest): Promise<ReturnPayload>
    {
        let queriedShows: MinifiedShowModel[] = await this.tmdbService.queryShows(req.pageStart, req.pageEnd, req.query);
        return { statusCode: 201, message: "Query was successful!", data: { queriedShows } }
    }

    /**
     * Will call getShow() from TMDB service to get a specific show from TMDB database.
     * @param param the :id param of the request from the client
     */
    @Get("get/:id")
    async getShow(@Param() param: TvShowGetRequestParam)
    {
        let show: TvShowModel = await this.tmdbService.getShow(param.id);
        return { statusCode: 201, message: "Query was successful!", data: { show } }
    }
}
