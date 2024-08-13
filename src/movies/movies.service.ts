import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import PaginationDto from '../common/dto/pagination.dto';
import { firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import FavoriteMovie from './entities/favorite-movie.entity';
import { CRUD, ERROR } from '../common/utils/messages.util';

@Injectable()
export default class MoviesService {
  private readonly logger = new Logger(MoviesService.name);

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(FavoriteMovie)
    private readonly favoriteMovieRepository: Repository<FavoriteMovie>,
  ) {}

  public findAllMovies = async ({ page }: PaginationDto) => {
    try {
      return await firstValueFrom(
        this.httpService.get(
          `discover/movie?include_adult=false&include_video=false&language=en-US&page=${page}&sort_by=popularity.desc`,
        ),
      );
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  };

  public findMovieTMDBById = async (id: number) => {
    try {
      return await firstValueFrom(
        this.httpService.get(`movie/${id}?language=en-US`),
      );
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  };

  public findMyMovies = async (userId: string) => {
    let favoriteMovies: FavoriteMovie[];
    try {
      favoriteMovies = await this.favoriteMovieRepository.find({
        where: { userId },
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }

    const movies = [];
    for (const favoriteMovie of favoriteMovies) {
      const { data } = await this.findMovieTMDBById(favoriteMovie.movieId);
      movies.push(data);
    }

    return movies;
  };

  private readonly findMovieById = async (movieId: number, userId: string) => {
    let favoriteMovie: FavoriteMovie;
    try {
      favoriteMovie = await this.favoriteMovieRepository.findOne({
        where: { movieId, userId },
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(ERROR.INTERNAL);
    }

    if (!favoriteMovie) throw new NotFoundException(ERROR.NOT_FOUND);
    return favoriteMovie;
  };

  public registerMovieAsFavorite = async (movieId: number, userId: string) => {
    let favoriteMovieFound: FavoriteMovie;

    try {
      favoriteMovieFound = await this.findMovieById(movieId, userId);
    } catch {}
    if (favoriteMovieFound) throw new ConflictException(ERROR.ALREADY_EXISTS);

    const favoriteMovie = this.favoriteMovieRepository.create({
      movieId,
      userId,
    });

    try {
      await this.favoriteMovieRepository.save(favoriteMovie);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(CRUD.CREATE);
    }
  };
}
