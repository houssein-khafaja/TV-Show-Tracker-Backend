import { Controller, Post, UseGuards, Body, Headers, Get, Res, Param, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SubscriptionsService } from '../services/subscriptions.service';
import { SubscriptionRequestBody, SubscriptionRequestHeaders } from '../dto/subscriptions.dto';
import { JwtService } from '@nestjs/jwt';
import { TmdbService } from '../services/tmdb-service';
import { Response } from 'express';

@Controller('tvshow')
@UseGuards(AuthGuard())
export class TvShowController 
{
    constructor(private readonly tmdbService: TmdbService) { }

    @Get("popular")
    async getPopularShows(@Query('start') pageStart: number, @Query('end') pageEnd: number)
    {
        // console.log(pageStart);
        // console.log(pageEnd);
        
        return await this.tmdbService.getPopularShows(pageStart, pageEnd);
    }

    @Get(":id")
    async getShow(@Param('id') id: number)
    {
        return this.tmdbService.getShow(id);
    }
}
