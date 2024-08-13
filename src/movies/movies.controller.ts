import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import MoviesService from './movies.service';
import PaginationDto from '../common/dto/pagination.dto';
import { ApiTags } from '@nestjs/swagger';
import AuthGuard from '../users/guards/auth.guard';
import { Request as Req } from 'express';

@Controller('movies')
@ApiTags('movies')
export default class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get('all')
  public async findAllMovies(@Query() dto: PaginationDto) {
    const { data } = await this.moviesService.findAllMovies(dto);
    return data;
  }

  @UseGuards(AuthGuard)
  @Get('my')
  public async findMyMovies(@Request() req: Req) {
    return await this.moviesService.findMyMovies(req['user'].id);
  }

  @UseGuards(AuthGuard)
  @Put('favorite/:id')
  public async registerMovieAsFavorite(
    @Request() req: Req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.moviesService.registerMovieAsFavorite(id, req['user'].id);
  }
}
