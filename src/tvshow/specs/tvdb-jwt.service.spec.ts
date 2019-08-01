/**--------------------------------------------------------------------------------------------------------------------------------------
 *  Unit Test [TvdbJwt Service]
 *
 *  Test Plan:
 *      - TvdbJwt Service should be defined    
 *
 *      - getNewTvdbJwtToken()
 *          -[Mock implementation of httpService.post to return a truthy result] returns true (means it worked)
 *          -[Mock implementation of httpService.post to return a falsey result] throws BadRequestException
 *
 *      - refreshTvdbJwtToken()
 *          -[Mock implementation of httpService.get to return a truthy result] returns true (means it worked)
 *          -[Mock implementation of httpService.get to return a falsey result] throws BadRequestException
 * 
 *      - onApplicationBootstrap
 *          -getNewTvdbJwtToken() was called
 *--------------------------------------------------------------------------------------------------------------------------------------**/

import { Test } from "@nestjs/testing";
import { ConfigService } from "../../config/config.service";
import { TvdbJwtService } from "../services/tvdb-jwt.service";
import { configServiceMock } from "../../config/mocks/config.mock";
import { HttpService, BadRequestException } from "@nestjs/common";
import { httpServiceMock } from "../mocks/http-service.mock";

describe('TvdbJwt Service', () =>
{
    let tvdbJwtService: TvdbJwtService;

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
                TvdbJwtService,
                ConfigServiceProvider,
                httpServiceProvider
            ]
        }).compile();

        // get the instances we want to test/spyOn
        tvdbJwtService = module.get<TvdbJwtService>(TvdbJwtService);

    });

    it('TvdbJwt Service should be defined', () =>
    {
        expect(tvdbJwtService).toBeDefined();
    });

    describe('getNewTvdbJwtToken()', () =>
    {
        it('[Mock implementation of httpService.post to return a truthy result] returns true (means it worked)', async () =>
        {
            // initialize test inputs and spies
            let httpPostSpyMock = jest.spyOn(httpServiceMock, "post").mockImplementation(() =>
                ({
                    toPromise: jest.fn(() => 
                    {
                        return { data: { token: "jwt token" } };
                    }),
                }));

            // run tests
            let testResult: boolean = await tvdbJwtService.getNewTvdbJwtToken();
            expect(testResult).toBe(true);
            expect(httpPostSpyMock).toBeCalledWith("tvdbLoginUri", { "apikey": configServiceMock.tvdbApiKey, "userkey": configServiceMock.tvdbUserKey, "username": configServiceMock.tvdbUsername });
        });

        it('[Mock implementation of httpService.post to return a falsey result] throws BadRequestException', async () =>
        {
            // initialize test inputs and spies
            let httpPostSpyMock = jest.spyOn(httpServiceMock, "post").mockImplementation(() =>
                ({
                    toPromise: jest.fn(() => 
                    {
                        return undefined;
                    }),
                }));

            // run tests
            let testResult: Promise<boolean> = tvdbJwtService.getNewTvdbJwtToken();
            await expect(testResult).rejects.toThrow(BadRequestException);
            expect(httpPostSpyMock).toBeCalledWith("tvdbLoginUri", { "apikey": configServiceMock.tvdbApiKey, "userkey": configServiceMock.tvdbUserKey, "username": configServiceMock.tvdbUsername });
        });
    });

    describe('getNewTvdbJwtToken()', () =>
    {
        it('[Mock implementation of httpService.get to return a truthy result] returns true (means it worked)', async () =>
        {
            // initialize test inputs and spies
            let httpGetSpyMock = jest.spyOn(httpServiceMock, "get").mockImplementation(() =>
                ({
                    toPromise: jest.fn(() => 
                    {
                        return { data: { token: "jwt token" } };
                    }),
                }));

            // run tests
            let testResult: boolean = await tvdbJwtService.refreshTvdbJwtToken();
            expect(testResult).toBe(true);
            expect(httpGetSpyMock).toBeCalledWith("tvdbRefreshUri", { headers: { Authorization: "Bearer " + configServiceMock.tvdbJwtToken } });
        });

        it('[Mock implementation of httpService.get to return a falsey result] throws BadRequestException', async () =>
        {
            // initialize test inputs and spies
            let httpGetSpyMock = jest.spyOn(httpServiceMock, "get").mockImplementation(() =>
                ({
                    toPromise: jest.fn(() => 
                    {
                        return undefined;
                    }),
                }));

            // run tests
            let testResult: Promise<boolean> = tvdbJwtService.refreshTvdbJwtToken();
            await expect(testResult).rejects.toThrow(BadRequestException);
            expect(httpGetSpyMock).toBeCalledWith("tvdbRefreshUri", { headers: { Authorization: "Bearer " + configServiceMock.tvdbJwtToken } });
        });
    });

    describe('onApplicationBootstrap()', async () =>
    {
        it('getNewTvdbJwtToken() was called', async () =>
        {
            // initialize test inputs and spies
            let getNewTvdbJwtTokenSpy: jest.Mock = jest.spyOn(tvdbJwtService, "getNewTvdbJwtToken").mockImplementation(jest.fn());

            // run tests
            await tvdbJwtService.onApplicationBootstrap();
            expect(getNewTvdbJwtTokenSpy).toBeCalled();
        })
    });
});