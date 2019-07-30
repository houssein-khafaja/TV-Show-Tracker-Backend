import { Controller, UseGuards, Get, Param, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TmdbService } from '../services/tmdb.service';
import { MinifiedShowModel, TvShowModel } from '../interfaces/subscription.interface';
import { ReturnPayload } from 'src/interfaces/general';
import { TvShowRequest } from '../dto/tvshow.dto';

@Controller('tvshow')
@UseGuards(AuthGuard())
export class TvShowController 
{
    constructor(private readonly tmdbService: TmdbService) { }

    @Get("query")
    async getPopularShows(@Query() req: TvShowRequest): Promise<ReturnPayload>
    {
        let queriedShows: MinifiedShowModel[] = await this.tmdbService.queryShows(req.pageStart, req.pageEnd, req.query);
        return { statusCode: 201, message: "Query was successful!", data: { queriedShows } }
    }

    @Get("get/:id")
    async getShow(@Param('id') id: number)
    {
        let show: TvShowModel = await this.tmdbService.getShow(id);
        return { statusCode: 201, message: "Query was successful!", data: { show } }
    }
}
