import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import UsersModule from './users/users.module';
import CommonModule from './common/common.module';
import MoviesModule from './movies/movies.module';
import JoiValidation from './common/config/env.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import dataSourceOptions from './common/config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: JoiValidation,
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    CommonModule,
    MoviesModule,
    UsersModule,
  ],
})
export class AppModule {}
