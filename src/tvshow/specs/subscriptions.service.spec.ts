/**--------------------------------------------------------------------------------------------------------------------------------------
 *  Unit Test [Subscription Service]
 *
 *  Test Plan:
 *      - Subscription Service should be defined    
 *
 *      - addSubscription()
 *          -[With non existing sub] returns a sub object, getSubscription() and this.subscriptionModel() are called with correct params
 *          -[With existing sub] throws ConflictException, getSubscription() called with correct params.
 *
 *      - deleteSubscription()
 *          -[With existing sub] returns true and deleteOne() is called with the correct params
 *          -[With nonexisting sub] throws NotFoundException and deleteOne() is called with the correct params
 *       
 *      - getSubscription()
 *          -[With non existing sub] returns a sub object, findOne is called with correct params
 *          -[With existing sub] returns falsey, findOne is called with correct params
 * 
 *      - getAllSubscriptions()
 *          -[with existing user] returns array of tvShows, find() gets called with correct params
 *          -[with non existing user] returns empty array, find() gets called with correct params
 *--------------------------------------------------------------------------------------------------------------------------------------**/

import { Test } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { SubscriptionsService } from "../services/subscriptions.service";
import { TmdbService } from "../services/tmdb.service";
import { tmdbServiceMock, mockedShowsList } from "../mocks/tmdb.mock";
import { Subscription, TvShowModel } from "../interfaces/subscription.interface";
import { ConflictException, NotFoundException } from "@nestjs/common";

describe('Subscription Service', () =>
{
    let subscriptionsService: SubscriptionsService;
    let subscriptionModel; // mongoose model

    beforeAll(async () =>
    {
        let TmdbServiceProvider =
        {
            provide: TmdbService,
            useValue: tmdbServiceMock
        };

        let SubscriptionModelProvider =
        {
            // provide a mocked version of our mongoose model
            provide: getModelToken("Subscription"),
            useValue: (() =>
            {
                const model: any = jest.fn();

                // mock the findOne().exec()
                model.deleteOne = jest.fn().mockImplementation((filter: { _userId: number, tmdbID: number }) => ({
                    exec: jest.fn(() => 
                    {
                        let show = tmdbServiceMock.getShow(filter.tmdbID);

                        // if we find a show, return deleted = 1, else deleted = 0
                        if (show)
                        {
                            return { deletedCount: 1 }
                        }
                        else
                        {

                            return { deletedCount: 0 }
                        }
                    }),
                }));

                model.findOne = jest.fn().mockImplementation((filter: { _userId: number, tmdbID: number }) =>
                {
                    return tmdbServiceMock.getShow(filter.tmdbID);
                });

                model.find = jest.fn().mockImplementation((filter: { _userId: number }) =>
                {
                    if (filter._userId == 69)
                    {
                        return mockedShowsList;
                    }
                    else
                    {
                        return [];
                    }
                });

                // mock the constructor
                model.mockImplementation((params: Subscription) =>
                {
                    return {
                        save: jest.fn(() => params)
                    }
                });

                return model;
            })(),
        }

        // init test module
        const module = await Test.createTestingModule({
            imports: [],
            providers: [
                SubscriptionsService,
                TmdbServiceProvider,
                SubscriptionModelProvider
            ]
        }).compile();

        // get the instances we want to test/spyOn
        subscriptionModel = module.get(getModelToken("Subscription"));
        subscriptionsService = module.get<SubscriptionsService>(SubscriptionsService);

    });

    it('Subscription Service should be defined', () =>
    {
        expect(subscriptionsService).toBeDefined();
    });

    describe('addSubscription()', () =>
    {
        it('[With non existing sub] returns a sub object, getSubscription() and this.subscriptionModel() are called with correct params', async () =>
        {
            // initialize test inputs and spies
            let _userId: number = 69;
            let tmdbID: number = 4; // we dont have one with an id of 4
            let getSubscriptionSpy: jest.SpyInstance = jest.spyOn(subscriptionsService, "getSubscription");

            // run tests
            let testResult: Subscription = await subscriptionsService.addSubscription(_userId, tmdbID);
            expect(testResult).toEqual({ _userId, tmdbID });
            expect(getSubscriptionSpy).toBeCalledWith(_userId, tmdbID);
            expect(subscriptionModel).toHaveBeenCalledWith({ _userId, tmdbID });
        });

        it('[With existing sub] throws ConflictException, getSubscription() called with correct params.', async () =>
        {
            // initialize test inputs and spies
            let _userId: number = 69;
            let tmdbID: number = 1;
            let getSubscriptionSpy: jest.SpyInstance = jest.spyOn(subscriptionsService, "getSubscription");

            // run tests
            let testResult: Promise<Subscription> = subscriptionsService.addSubscription(_userId, tmdbID);
            await expect(testResult).rejects.toThrow(ConflictException);
            expect(getSubscriptionSpy).toBeCalledWith(_userId, tmdbID);
        });

        // this test should be done in e2e tests because the controller will validate the data before it comes in,
        // and prevent undefined values from getting into addSubscription
        // it('[With empty inputs] throws ConflictException, getSubscription() called with correct params.', async () =>
        // {
        //     // initialize test inputs and spies
        //     let _userId: number = 69;
        //     let tmdbID: number;
        //     let getSubscriptionSpy: jest.SpyInstance = jest.spyOn(subscriptionsService, "getSubscription");

        //     // run tests
        //     let testResult: Promise<Subscription> = subscriptionsService.addSubscription(_userId, tmdbID);
        //     await expect(testResult).rejects.toThrow(ConflictException);
        //     expect(getSubscriptionSpy).toBeCalledWith(_userId, tmdbID);
        // });
    });

    describe('deleteSubscription()', () =>
    {
        it('[With existing sub] returns true and deleteOne() is called with the correct params', async () =>
        {
            // initialize test inputs and spies
            let _userId: number = 69;
            let tmdbID: number = 1;
            let deleteOneSpy: jest.SpyInstance = jest.spyOn(subscriptionModel, "deleteOne");

            // run tests
            let testResult: boolean = await subscriptionsService.deleteSubscription(_userId, tmdbID);
            expect(testResult).toBe(true);
            expect(deleteOneSpy).toBeCalledWith({ _userId, tmdbID });
        });

        it('[With nonexisting sub] throws NotFoundException and deleteOne() is called with the correct params', async () =>
        {
            // initialize test inputs and spies
            let _userId: number = 69;
            let tmdbID: number = 4;
            let deleteOneSpy: jest.SpyInstance = jest.spyOn(subscriptionModel, "deleteOne");

            // run tests
            let testResult: Promise<boolean> = subscriptionsService.deleteSubscription(_userId, tmdbID);
            await expect(testResult).rejects.toThrow(NotFoundException);
            expect(deleteOneSpy).toBeCalledWith({ _userId, tmdbID });
        });
    });

    describe('getSubscription()', () =>
    {
        it('[With existing sub] returns a sub object, findOne is called with correct params', async () =>
        {
            // initialize test inputs and spies
            let _userId: number = 69;
            let tmdbID: number = 1;
            let findOneSpy: jest.SpyInstance = jest.spyOn(subscriptionModel, "findOne");

            // run tests
            let testResult: Subscription = await subscriptionsService.getSubscription(_userId, tmdbID);
            expect(testResult).toEqual(tmdbServiceMock.getShow(tmdbID));
            expect(findOneSpy).toBeCalledWith({ _userId, tmdbID });
        });

        it('[With non existing sub] returns falsey, findOne is called with correct params', async () =>
        {
            // initialize test inputs and spies
            let _userId: number = 69;
            let tmdbID: number = 4;
            let findOneSpy: jest.SpyInstance = jest.spyOn(subscriptionModel, "findOne");

            // run tests
            let testResult: Subscription = await subscriptionsService.getSubscription(_userId, tmdbID);
            expect(testResult).toBeUndefined();
            expect(findOneSpy).toBeCalledWith({ _userId, tmdbID });
        });
    });

    describe('getAllSubscriptions()', () =>
    {
        it('[with existing user] returns array of tvShows, find() gets called with correct params', async () =>
        {
            // initialize test inputs and spies
            let _userId: number = 69;
            let findSpy: jest.SpyInstance = jest.spyOn(subscriptionModel, "find");

            // run tests
            let testResult: TvShowModel[] = await subscriptionsService.getAllSubscriptions(_userId);
            expect(testResult).toEqual(tmdbServiceMock.getShows([1, 2, 3]));
            expect(findSpy).toBeCalledWith({ _userId });
        });

        it('[with non existing user] returns empty array, find() gets called with correct params', async () =>
        {
            // initialize test inputs and spies
            let _userId: number = 1;
            let findSpy: jest.SpyInstance = jest.spyOn(subscriptionModel, "find");

            // run tests
            let testResult: TvShowModel[] = await subscriptionsService.getAllSubscriptions(_userId);
            expect(testResult).toHaveLength(0);
            expect(findSpy).toBeCalledWith({ _userId });
        });
    });
});