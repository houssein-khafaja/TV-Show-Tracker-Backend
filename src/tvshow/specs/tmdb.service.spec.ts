/**--------------------------------------------------------------------------------------------------------------------------------------
 *  Unit Test [Tmdb Service]
 *
 *  Test Plan:
 *      - Tmdb Service should be defined    
 *
 *      - genereIDsToObjects()
 *          -[With  [10759, 10751, 10762, 10768]] returns an array of specific genre objects
 * 
 *      - queryShows()
 *          -[With pageStart > pageEnd] throws BadRequestException
 *          -[With pageStart=1, pageEnd=1, query given] returns appropriate data (length 3) and http.get() was called with a string param
 *          -[With pageStart=1, pageEnd=1, no query given] returns appropriate data (length 3) and http.get() was called with a string param
 *          -[With pageStart=1, pageEnd=3, query given] returns appropriate data (length 9) and http.get() was called with a string param
 *          -[With pageStart=1, pageEnd not given, query given] returns appropriate data (length 30) and http.get() was called with a string param
 *          -[With pageStart not given, pageEnd=4, query given] returns appropriate data (length 12) and http.get() was called with a string param
 *
 *      - getShow()
 *          -[With showID = 1] returns show with showID = 1
 *          -[With no showID] throws BadRequestException
 *      
 *      - getShows()
 *          -[With empty array] throws NotFoundException
 *          -[With array [1, 2, 3]] returns array length of 3 with correct shows
 *      
 *      - onApplicationBootstrap
 *          -httpService.get() was called
 *--------------------------------------------------------------------------------------------------------------------------------------**/

import { Test } from "@nestjs/testing";
import { ConfigService } from "../../config.service";
import { TvdbJwtService } from "../services/tvdb-jwt.service";
import { configServiceMock } from "../../mocks/config.mock";
import { HttpService, BadRequestException, NotFoundException } from "@nestjs/common";
import { httpServiceMock } from "../mocks/http-service.mock";
import { TmdbService } from "../services/tmdb.service";
import { mockedShowsList, mockedMinifiedShowList, mockedGenres, tmdbServiceMock } from "../mocks/tmdb.mock";
import { MinifiedShowModel, TvShowModel } from "../interfaces/subscription.interface";

describe('Tmdb Service', () =>
{
    let tmdbService: TmdbService;

    beforeAll(async () =>
    {
        let ConfigServiceProvider =
        {
            provide: ConfigService,
            useValue: configServiceMock
        }

        let httpServiceProvider =
        {
            provide: HttpService,
            useValue: httpServiceMock
        }


        // init test module
        const module = await Test.createTestingModule({
            imports: [],
            providers: [
                TmdbService,
                ConfigServiceProvider,
                httpServiceProvider
            ]
        }).compile();

        // get the instances we want to test/spyOn
        tmdbService = module.get<TmdbService>(TmdbService);
    });

    it('Tmdb Service should be defined', () =>
    {
        expect(tmdbService).toBeDefined();
    });

    describe('genereIDsToObjects()', () =>
    {
        it('[With  [10759, 10751, 10762, 10768]] returns an array of specific genre objects', async () =>
        {
            // initialize test inputs and spies
            let genreIDs: number[] = [10759, 10751, 10762, 10768];
            let expected =
                [{ id: 10759, name: 'Action & Adventure' },
                { id: 10751, name: 'Family' },
                { id: 10762, name: 'Kids' },
                { id: 10768, name: 'War & Politics' }];

            jest.spyOn(tmdbService, "genreList", "get").mockImplementation(() =>
            {
                return mockedGenres;
            });

            // run tests
            let testResult: MinifiedShowModel["genres"] = await tmdbService.genereIDsToObjects(genreIDs);
            expect(testResult).toEqual(expected);
        });
    });

    describe('queryShows()', () =>
    {
        it('[With pageStart > pageEnd] throws BadRequestException', async () =>
        {
            // initialize test inputs and spies

            // run tests
            let testResult: Promise<MinifiedShowModel[]> = tmdbService.queryShows(2, 1);
            expect(testResult).rejects.toThrow(BadRequestException);
        });

        it('[With pageStart=1, pageEnd=1, query given] returns appropriate data (length 3) and http.get() was called with a string param', async () =>
        {
            // initialize test inputs and spies
            let httpGetSpyMock = jest.spyOn(httpServiceMock, "get").mockImplementation(() =>
                ({
                    toPromise: jest.fn(() => 
                    {
                        return { data: { results: mockedMinifiedShowList } };
                    }),
                }));

            jest.spyOn(tmdbService, "genereIDsToObjects").mockImplementation((genreIDs: number[]) => 
            {
                return mockedGenres.filter(i => genreIDs.indexOf(i.id) >= 0)
            }).mockClear();

            // run tests
            let testResult: MinifiedShowModel[] = await tmdbService.queryShows(1, 1, "star wars");
            expect(testResult).toHaveLength(3);
            expect(testResult[0].tmdbID).toBe(mockedMinifiedShowList[0].id);
            expect(testResult[1].tmdbID).toBe(mockedMinifiedShowList[1].id);
            expect(testResult[2].tmdbID).toBe(mockedMinifiedShowList[2].id);
            expect(httpGetSpyMock).toBeCalledWith(expect.any(String));
        });

        it('[With pageStart=1, pageEnd=1, no query given] returns appropriate data (length 3) and http.get() was called with a string param', async () =>
        {
            // initialize test inputs and spies
            let httpGetSpyMock = jest.spyOn(httpServiceMock, "get").mockImplementation(() =>
                ({
                    toPromise: jest.fn(() => 
                    {
                        return { data: { results: mockedMinifiedShowList } };
                    }),
                }));

            jest.spyOn(tmdbService, "genereIDsToObjects").mockImplementation((genreIDs: number[]) => 
            {
                return mockedGenres.filter(i => genreIDs.indexOf(i.id) >= 0)
            }).mockClear();;

            // run tests
            let testResult: MinifiedShowModel[] = await tmdbService.queryShows(1, 1);
            expect(testResult).toHaveLength(3);
            expect(testResult[0].tmdbID).toBe(mockedMinifiedShowList[0].id);
            expect(testResult[1].tmdbID).toBe(mockedMinifiedShowList[1].id);
            expect(testResult[2].tmdbID).toBe(mockedMinifiedShowList[2].id);
            expect(httpGetSpyMock).toBeCalledWith(expect.any(String));
        });

        it('[With pageStart=1, pageEnd=3, query given] returns appropriate data (length 9) and http.get() was called with a string param', async () =>
        {
            // initialize test inputs and spies
            let httpGetSpyMock = jest.spyOn(httpServiceMock, "get").mockImplementation(() =>
                ({
                    toPromise: jest.fn(() => 
                    {
                        return { data: { results: mockedMinifiedShowList } };
                    }),
                }));

            jest.spyOn(tmdbService, "genereIDsToObjects").mockImplementation((genreIDs: number[]) => 
            {
                return mockedGenres.filter(i => genreIDs.indexOf(i.id) >= 0)
            }).mockClear();;

            // run tests
            let testResult: MinifiedShowModel[] = await tmdbService.queryShows(1, 3, "star wars");
            expect(testResult).toHaveLength(9);
            expect(testResult[0].tmdbID).toBe(mockedMinifiedShowList[0].id);
            expect(testResult[1].tmdbID).toBe(mockedMinifiedShowList[1].id);
            expect(testResult[2].tmdbID).toBe(mockedMinifiedShowList[2].id);
            expect(httpGetSpyMock).toBeCalledWith(expect.any(String));
        });

        it('[With pageStart=1, pageEnd not given, query given] returns appropriate data (length 30) and http.get() was called with a string param', async () =>
        {
            // initialize test inputs and spies
            let httpGetSpyMock = jest.spyOn(httpServiceMock, "get").mockImplementation(() =>
                ({
                    toPromise: jest.fn(() => 
                    {
                        return { data: { results: mockedMinifiedShowList } };
                    }),
                }));

            jest.spyOn(tmdbService, "genereIDsToObjects").mockImplementation((genreIDs: number[]) => 
            {
                return mockedGenres.filter(i => genreIDs.indexOf(i.id) >= 0)
            });

            // run tests
            let testResult: MinifiedShowModel[] = await tmdbService.queryShows(1, undefined, "star wars");
            expect(testResult).toHaveLength(30);
            expect(testResult[0].tmdbID).toBe(mockedMinifiedShowList[0].id);
            expect(testResult[1].tmdbID).toBe(mockedMinifiedShowList[1].id);
            expect(testResult[2].tmdbID).toBe(mockedMinifiedShowList[2].id);
            expect(httpGetSpyMock).toBeCalledWith(expect.any(String));
        });

        it('[With pageStart not given, pageEnd=4, query given] returns appropriate data (length 12) and http.get() was called with a string param', async () =>
        {
            // initialize test inputs and spies
            let httpGetSpyMock = jest.spyOn(httpServiceMock, "get").mockImplementation(() =>
                ({
                    toPromise: jest.fn(() => 
                    {
                        return { data: { results: mockedMinifiedShowList } };
                    }),
                }));

            jest.spyOn(tmdbService, "genereIDsToObjects").mockImplementation((genreIDs: number[]) => 
            {
                return mockedGenres.filter(i => genreIDs.indexOf(i.id) >= 0)
            }).mockClear();;

            // run tests
            let testResult: MinifiedShowModel[] = await tmdbService.queryShows(undefined, 4, "star wars");
            expect(testResult).toHaveLength(12);
            expect(testResult[0].tmdbID).toBe(mockedMinifiedShowList[0].id);
            expect(testResult[1].tmdbID).toBe(mockedMinifiedShowList[1].id);
            expect(testResult[2].tmdbID).toBe(mockedMinifiedShowList[2].id);
            expect(httpGetSpyMock).toBeCalledWith(expect.any(String));
        });

    });

    describe('getShow()', () =>
    {
        it('[With showID = 1] returns show with showID = 1', async () =>
        {
            // initialize test inputs and spies
            let showID: number = 1;
            let httpGetSpyMock = jest.spyOn(httpServiceMock, "get").mockImplementation((uri: string) =>
                ({
                    toPromise: jest.fn(() => 
                    {
                        if (uri == `https://api.themoviedb.org/3/tv/${showID}?api_key=${configServiceMock.tmdbApiKey}&append_to_response=videos,external_ids`)
                        {
                            return { data: tmdbServiceMock.getShow(showID) };
                        }
                        else
                        {
                            return {
                                data:
                                {
                                    data: { id: 84831, airsDayOfWeek: "airsDayOfWeek", airsTime: "airsTime" }
                                }
                            };
                        }
                    }),
                }));

            // run tests
            let testResult: TvShowModel = await tmdbService.getShow(showID);
            expect(testResult.tmdbID).toBe(showID);
        });

        it('[With no showID] throws BadRequestException', async () =>
        {
            // initialize test inputs and spies
            let showID: number;

            // run tests
            let testResult: Promise<TvShowModel> = tmdbService.getShow(showID);
            await expect(testResult).rejects.toThrow(BadRequestException);
        });

    });

    describe('getShows()', () =>
    {
        it('[With empty array] throws NotFoundException', async () =>
        {
            // initialize test inputs and spies
            let showIDs: number[] = [];

            // run tests
            let testResult: Promise<TvShowModel[]> = tmdbService.getShows(showIDs);
            await expect(testResult).rejects.toThrow(BadRequestException);
        });

        it('[With array [1,2,3]] returns array length of 3 with correct shows', async () =>
        {
            // initialize test inputs and spies
            let showIDs: number[] = [1, 2, 3];
            let httpGetSpyMock = jest.spyOn(httpServiceMock, "get").mockImplementation((uri: string) =>
                ({
                    toPromise: jest.fn(() => 
                    {
                        if (uri == `https://api.themoviedb.org/3/tv/1?api_key=${configServiceMock.tmdbApiKey}&append_to_response=videos,external_ids`)
                        {
                            return { data: tmdbServiceMock.getShow(1) };
                        }
                        else if (uri == `https://api.themoviedb.org/3/tv/2?api_key=${configServiceMock.tmdbApiKey}&append_to_response=videos,external_ids`)
                        {
                            return { data: tmdbServiceMock.getShow(2) };
                        }
                        else if (uri == `https://api.themoviedb.org/3/tv/3?api_key=${configServiceMock.tmdbApiKey}&append_to_response=videos,external_ids`)
                        {
                            return { data: tmdbServiceMock.getShow(3) };
                        }
                        else
                        {
                            return {
                                data:
                                {
                                    data: { id: 84831, airsDayOfWeek: "airsDayOfWeek", airsTime: "airsTime" }
                                }
                            };
                        }
                    }),
                }));

            // run tests
            let testResult: TvShowModel[] = await tmdbService.getShows(showIDs);
            expect(testResult).toHaveLength(3);
            expect(testResult[0].tmdbID).toBe(tmdbServiceMock.getShow(1).tmdbID);
            expect(testResult[1].tmdbID).toBe(tmdbServiceMock.getShow(2).tmdbID);
            expect(testResult[2].tmdbID).toBe(tmdbServiceMock.getShow(3).tmdbID);
        });
    });

    describe('onApplicationBootstrap()', () =>
    {
        it('getNewTvdbJwtToken() was called', async () =>
        {
            // initialize test inputs and spies
            let httpGetSpyMock = jest.spyOn(httpServiceMock, "get").mockImplementation(() =>
                ({
                    toPromise: jest.fn(() => ({ data: { genres: [] } })),
                }));

            // run tests
            await tmdbService.onApplicationBootstrap();
            expect(httpGetSpyMock).toBeCalled();
        })
    });
});