import { Module } from '@nestjs/common';
import MoviesService from './movies.service';
import MoviesController from './movies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import FavoriteMovie from './entities/favorite-movie.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FavoriteMovie])],
  controllers: [MoviesController],
  providers: [MoviesService],
})
export default class MoviesModule {}
