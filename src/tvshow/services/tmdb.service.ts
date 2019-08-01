import { Injectable, InternalServerErrorException, NotFoundException, NotAcceptableException, HttpService, OnApplicationBootstrap, BadRequestException } from '@nestjs/common';
import { TvShowModel, MinifiedShowModel } from '../interfaces/subscription.interface';
import { promises } from 'fs';
import { ConfigService } from '../../config.service';
import { AxiosPromise, AxiosResponse, AxiosRequestConfig } from 'axios';

/**
 * This purpose of this service is to interface with the TMDB API to get TV show data.
 * 
 * Later on you will notice that we also hit the TVDB API in order to get the air times of the shows. We
 * want the air times of the shows so that front-ends can send timely notifications to users tracking shows.
 * 
 * TMDB data usually have an external_ids field which contains the IDs of the show from other databases,
 * and TVDB is included in that list. That means we can always get the TMDB data along with the TVDB ID at the same time, allowing
 * us to reliably merge two sources of data together.
 */
@Injectable()
export class TmdbService implements OnApplicationBootstrap
{
    // holds the list of all genres of TMDB shows
    // we need to do this because sometimes we only get genre IDs,
    // so we can use this array to cross reference and return the genre name
    private genres: MinifiedShowModel["genres"];

    /* istanbul ignore next */
    get genreList(): MinifiedShowModel["genres"] { return this.genres; }

    constructor(
        private readonly httpService: HttpService,
        private readonly config: ConfigService)
    { }

    async onApplicationBootstrap()
    {
        // we need to call the api to get a list of genres because they decided
        // to return only the ID's with some endpoints and not others
        this.genres = (await this.httpService.get(`https://api.themoviedb.org/3/genre/tv/list?api_key=${this.config.tmdbApiKey}&language=en-US`).toPromise()).data.genres;
    }

    /**
     * Searchs TMDB with an optional query input and returns a paginated list of most relveant shows.
     * Will return the most popular shows if no query word is given.
     * @param pageStart starting page of data to return
     * @param pageEnd last page of data to return
     * @param query optional query param to filter results
     * @throws BadRequestException if the pageStart is greater than pageEnd
     * @returns an array of TV shows, of the MinifiedShowModel variety
     */
    async queryShows(pageStart: number = 1, pageEnd: number = 10, query?: string): Promise<MinifiedShowModel[]>
    {
        if (pageStart > pageEnd)
        {
            throw new BadRequestException("Doesn't make sense for pageStart to be greater than pageEnd!");
        }
        else
        {
            const requestPromises: Promise<AxiosResponse>[] = []; // contains batch of promises
            const showsToSend: MinifiedShowModel[] = []; // save all the shows we want to send to the user here

            // store all the promises for X - X pages of shows
            for (let i = pageStart; i <= pageEnd; i++)
            {
                if (query)
                {
                    // query for a list of shows if a query is given
                    requestPromises.push(this.httpService.get(`https://api.themoviedb.org/3/search/tv?api_key=${this.config.tmdbApiKey}&language=en-US&query=${query}&page=${i}`).toPromise());
                }
                else
                {
                    // otherwise just return popular shows
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
                        tmdbID: show.id,
                        name: show.name,
                        overview: show.overview,
                        poster_path: show.poster_path,
                        vote_average: show.vote_average,
                        vote_count: show.vote_count,
                        genres: this.genereIDsToObjects(show.genre_ids),
                    }

                    showsToSend.push(popularShowToSend);
                });
            });

            return showsToSend;
        }
    }

    // gets a single show based on given showID
    async getShow(showID: number): Promise<TvShowModel>
    {
        let result: TvShowModel[] = await this.getShows([showID]);

        return result[0];
    }

    /**
     * This method will return a collection of specific TV shows based on the provided
     * showIDs. Both the TMDB and TVDB databases are hit in order to include all of the data we need. 
     * TMDB provides most of it, while TVDB returns air times. The data we get from this method is more 
     * detailed than queryShows().
     * @param showIDs an array of show ID's to query the database with
     * @throws BadRequestException when no show IDs were provided
     * @returns an array of TV shows of the TvShowModel variety
     */
    async getShows(showIDs: number[]): Promise<TvShowModel[]>
    {
        if (showIDs.length == 0)
        {
            throw new BadRequestException("No show IDs were given, probably due to an internal error.");
        }

        // we need to make a batch  of requests to TMDB so we will save them as promises
        let requestPromises: Promise<AxiosResponse>[] = [];

        // this array will hold all of the data objects we will send back
        const tvShowsToSend: TvShowModel[] = [];

        // for each sub id, create a promise to get the data
        showIDs.forEach(async (sub) =>
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
                tmdbID: res.data.id
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

    /**
     * Convert an array of genere IDs to full genre objects (which includes the names).
     * This is where our locally stored genres list comes in hand.
     * @param genreIDs an array of genre IDs to be converted
     * @returns an array genre objects
     */
    genereIDsToObjects(genreIDs: number[]): MinifiedShowModel["genres"]
    {
        // the genres list (which contains all genres) gets filtered down to a subset of
        // genres where their ID's match with at least one ID in the input array (genreIDs)
        return this.genreList.filter(i => genreIDs.indexOf(i.id) >= 0);
    }
}
