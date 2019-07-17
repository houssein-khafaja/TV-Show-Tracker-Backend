import { Injectable, InternalServerErrorException, NotFoundException, NotAcceptableException, HttpService, OnApplicationBootstrap, BadRequestException } from '@nestjs/common';
import { TvShowModel, MinifiedShowModel } from '../interfaces/subscription.interface';
import { promises } from 'fs';
import { ConfigService } from '../../config.service';
import { AxiosPromise, AxiosResponse, AxiosRequestConfig } from 'axios';

@Injectable()
export class TmdbService implements OnApplicationBootstrap
{
    private genres: { id: number, name: string }[];

    getGenre(id: number): string
    {
        return this.genres.find(i => i.id === id).name;
    }

    constructor(
        private readonly httpService: HttpService,
        private readonly config: ConfigService)
    { }

    async onApplicationBootstrap()
    {
        // we need to call the api to get a list of genres because for some reason they decided
        // to return only the ID's with some endpoints and not others (why not include the names ALL the time?)
        this.genres = (await this.httpService.get(`https://api.themoviedb.org/3/genre/tv/list?api_key=${this.config.tmdbApiKey}&language=en-US`).toPromise()).data.genres;


    }

    async queryShows(pageStart: number = 1, pageEnd: number = 10, query?: string)
    {
        if (pageStart > pageEnd)
        {
            throw new BadRequestException("Doesn't make sense for pageStart to be greater than pageEnd!");
        }
        else
        {

            const requestPromises: Promise<AxiosResponse>[] = []; // contains batch of promises
            const showsToSend: MinifiedShowModel[] = [];

            // store all the promises for X - X pages of shows
            for (let i = pageStart; i <= pageEnd; i++)
            {
                // query for a list of shows if a query is given, otherwise just return popular shows
                if (query)
                {
                    requestPromises.push(this.httpService.get(`https://api.themoviedb.org/3/search/tv?api_key=${this.config.tmdbApiKey}&language=en-US&query=${query}&page=${i}`).toPromise());
                }
                else
                {
                    requestPromises.push(this.httpService.get(`https://api.themoviedb.org/3/discover/tv?api_key=${this.config.tmdbApiKey}&include_null_first_air_dates=false&language=en-US&sort_by=popularity.desc&without_genres=16&page=${i}`).toPromise());
                }

            }

            // execute batch of promises
            const responses: AxiosResponse[] = await Promise.all(requestPromises);

            // for each response, extract data from results
            // then append to popularShowsToSend
            responses.forEach(res => 
            {
                res.data.results.forEach(show => 
                {
                    const popularShowToSend: MinifiedShowModel =
                    {
                        tmdbId: show.id,
                        name: show.name,
                        overview: show.overview,
                        poster_path: show.poster_path,
                        vote_average: show.vote_average,
                        vote_count: show.vote_count,
                        // Oof, not very readable but heres whats happening:
                        // the genres list (which contains all genres) gets filtered down to a subset of
                        // genres where only the genres belonging to the popularShow remain
                        genres: this.genres.filter(i => show.genre_ids.indexOf(i.id) >= 0),
                    }
                    showsToSend.push(popularShowToSend);
                });
            });

            return { statusCode: 201, data: showsToSend };
        }
    }

    async getShow(showID: number): Promise<{}>
    {
        return { statusCode: 201, data: (await this.getShows([showID]))[0] }
    }

    async getShows(showIDs: number[]): Promise<TvShowModel[]>
    {
        // we need to make a batch  of requests to TMDB so we will save them as promises
        let requestPromises: Promise<AxiosResponse>[] = [];

        // this array will hold all of the data objects we will send back
        const tvShowsToSend: TvShowModel[] = [];

        // for each sub id, create a promise to get the data
        showIDs.forEach(sub =>
        {
            requestPromises.push(this.httpService.get(`https://api.themoviedb.org/3/tv/${sub}?api_key=${this.config.tmdbApiKey}&append_to_response=videos,external_ids`).toPromise());
        });

        // execute all promises to get TV data from TMDB API
        let responses: AxiosResponse[] = await Promise.all(requestPromises);

        // clear request promises to reuse it later
        requestPromises = [];

        // populate tvShowsToSend with data retrieved from tmdb
        responses.forEach(res =>
        {
            // extract from res data  to send back (we still dont have air times yet)
            const tvShowToSend: TvShowModel =
            {
                name: res.data.name,
                overview: res.data.overview,
                network: res.data.network,
                poster_path: res.data.poster_path,
                vote_average: res.data.vote_average,
                vote_count: res.data.vote_count,
                episode_run_time: res.data.episode_run_time,
                genres: res.data.genres,
                videos: res.data.videos,
                external_ids: res.data.external_ids,
                tmdbId: res.data.id
            };

            tvShowsToSend.push(tvShowToSend)

            // add promise for the request to tvdb api so we can get air times
            requestPromises.push(this.httpService.get(this.config.tvdbSeriesUri + `/${tvShowToSend.external_ids.tvdb_id}`, this.config.tvdbAuthConfig).toPromise());

        });

        // execute batch promises to get airTimes data from TVDB API
        responses = await Promise.all(requestPromises);

        // edit tvShowsToSend with data retrieved from tvdb
        responses.forEach(responseData =>
        {
            // find subscription that matches with the tvdb ID
            const subscription: TvShowModel = tvShowsToSend.find(i => i.external_ids.tvdb_id === responseData.data.data.id);

            // subscription object is a refrence so we can edit it directly
            subscription.airsDayOfWeek = responseData.data.data.airsDayOfWeek;
            subscription.airsTime = responseData.data.data.airsTime;
        });

        return tvShowsToSend;
    }
}
