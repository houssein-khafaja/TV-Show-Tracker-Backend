import { NotFoundException } from "@nestjs/common";


export const tmdbServiceMock =
{
    getShows: jest.fn((subscriptionIDs: number[]) => 
    {
        if (subscriptionIDs[0] == 1 && subscriptionIDs[1] == 2 && subscriptionIDs[2] == 3)
        {
            return mockedShowsList;
        }
        else
        {
            throw new NotFoundException("No subscriptions were found!");
        }
    }),

    getShow: jest.fn((subscriptionID: number) => 
    {
        return mockedShowsList.find(show => show.tmdbID == subscriptionID);
    })
};

export let mockedGenres =
    [
        { id: 10759, name: 'Action & Adventure' },
        { id: 16, name: 'Animation' },
        { id: 35, name: 'Comedy' },
        { id: 80, name: 'Crime' },
        { id: 99, name: 'Documentary' },
        { id: 18, name: 'Drama' },
        { id: 10751, name: 'Family' },
        { id: 10762, name: 'Kids' },
        { id: 9648, name: 'Mystery' },
        { id: 10763, name: 'News' },
        { id: 10764, name: 'Reality' },
        { id: 10765, name: 'Sci-Fi & Fantasy' },
        { id: 10766, name: 'Soap' },
        { id: 10767, name: 'Talk' },
        { id: 10768, name: 'War & Politics' },
        { id: 37, name: 'Western' }
    ]
export let mockedMinifiedShowList =
    [{
        "original_name": "The Flash",
        "genre_ids": [
            18,
            10765
        ],
        "name": "The Flash",
        "popularity": 281.04,
        "origin_country": [
            "US"
        ],
        "vote_count": 2756,
        "first_air_date": "2014-10-07",
        "backdrop_path": "/jC1KqsFx8ZyqJyQa2Ohi7xgL7XC.jpg",
        "original_language": "en",
        "id": 60735,
        "vote_average": 6.7,
        "overview": "After a particle accelerator causes a freak storm, CSI Investigator Barry Allen is struck by lightning and falls into a coma. Months later he awakens with the power of super speed, granting him the ability to move through Central City like an unseen guardian angel. Though initially excited by his newfound powers, Barry is shocked to discover he is not the only \"meta-human\" who was created in the wake of the accelerator explosion -- and not everyone is using their new powers for good. Barry partners with S.T.A.R. Labs and dedicates his life to protect the innocent. For now, only a few close friends and associates know that Barry is literally the fastest man alive, but it won't be long before the world learns what Barry Allen has become...The Flash.",
        "poster_path": "/fki3kBlwJzFp8QohL43g9ReV455.jpg"
    },
    {
        "original_name": "ドラゴンボール",
        "genre_ids": [
            16,
            35,
            10759,
            10765
        ],
        "name": "Dragon Ball",
        "popularity": 263.445,
        "origin_country": [
            "JP"
        ],
        "vote_count": 334,
        "first_air_date": "1986-02-26",
        "backdrop_path": "/iflq7ZJfso6WC7gk9l1tD3unWK.jpg",
        "original_language": "ja",
        "id": 12609,
        "vote_average": 7,
        "overview": "Long ago in the mountains, a fighting master known as Gohan discovered a strange boy whom he named Goku. Gohan raised him and trained Goku in martial arts until he died. The young and very strong boy was on his own, but easily managed. Then one day, Goku met a teenage girl named Bulma, whose search for the dragon balls brought her to Goku's home. Together, they set off to find all seven dragon balls in an adventure.",
        "poster_path": "/3wx3EAMtqnbSLhGG8NrqXriCUIQ.jpg"
    },
    {
        "original_name": "Legion",
        "genre_ids": [
            10759,
            10765
        ],
        "name": "Legion",
        "popularity": 254.887,
        "origin_country": [
            "US"
        ],
        "vote_count": 586,
        "first_air_date": "2017-02-08",
        "backdrop_path": "/87eP7ITTrOWvkA4EqCuoRdyjzLy.jpg",
        "original_language": "en",
        "id": 67195,
        "vote_average": 7.6,
        "overview": "David Haller, AKA Legion, is a troubled young man who may be more than human. Diagnosed as schizophrenic, David has been in and out of psychiatric hospitals for years. But after a strange encounter with a fellow patient, he’s confronted with the possibility that the voices he hears and the visions he sees might be real.",
        "poster_path": "/vT0Zsbm4GWd7llNjgWEtwY0CqOv.jpg"
    }]
export const mockedShowsList = [
    {
        "name": "Pride",
        "overview": "Pride is a Japanese drama.",
        "poster_path": "/wQKwrZc8Mtuyaqx2HcIxWi7FOGp.jpg",
        "vote_average": 9.6,
        "vote_count": 4,
        "episode_run_time": [
            60
        ],
        "genres": [
            {
                "id": 18,
                "name": "Drama"
            }
        ],
        "videos": {
            "results": []
        },
        "external_ids": {
            "imdb_id": "tt0416409",
            "freebase_mid": "/m/05wrnq",
            "freebase_id": null,
            "tvdb_id": 84831,
            "tvrage_id": null,
            "facebook_id": null,
            "instagram_id": null,
            "twitter_id": null
        },
        "tmdbID": 1,
        "id": 1,
        "airsDayOfWeek": "Monday",
        "airsTime": "19:00"
    },
    {
        "name": "Clerks: The Animated Series",
        "overview": "Clerks is an American animated sitcom based on Kevin Smith's 1994 comedy of the same name. It was developed for television by Smith, Smith's producing partner Scott Mosier and former Seinfeld writer David Mandel with character designs by Stephen Silver.",
        "poster_path": "/A18OwjpaajPbOc5NYS8KaQO9Ef2.jpg",
        "vote_average": 6.9,
        "vote_count": 43,
        "episode_run_time": [
            30,
            22
        ],
        "genres": [
            {
                "id": 16,
                "name": "Animation"
            },
            {
                "id": 35,
                "name": "Comedy"
            }
        ],
        "videos": {
            "results": []
        },
        "external_ids": {
            "imdb_id": "tt0210413",
            "freebase_mid": "/m/07gwr6",
            "freebase_id": "/en/clerks_the_animated_series",
            "tvdb_id": 71745,
            "tvrage_id": null,
            "facebook_id": null,
            "instagram_id": null,
            "twitter_id": null
        },
        "tmdbID": 2,
        "id": 2,
        "airsDayOfWeek": "",
        "airsTime": ""
    },
    {
        "name": "The Message",
        "overview": "The Message was a surreal comedy series which spoofs current practices in the television industry. It originally aired in 2006 on BBC Three. It consisted of six episodes, and was not renewed after the first season.",
        "poster_path": null,
        "vote_average": 0,
        "vote_count": 0,
        "episode_run_time": [
            25,
            30
        ],
        "genres": [
            {
                "id": 35,
                "name": "Comedy"
            }
        ],
        "videos": {
            "results": []
        },
        "external_ids": {
            "imdb_id": null,
            "freebase_mid": "/m/0g5jjc",
            "freebase_id": null,
            "tvdb_id": 82776,
            "tvrage_id": 11206,
            "facebook_id": null,
            "instagram_id": null,
            "twitter_id": null
        },
        "tmdbID": 3,
        "id": 3,
        "airsDayOfWeek": "",
        "airsTime": ""
    }
];