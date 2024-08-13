import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import EncryptService from './services/encrypt.service';
import NodemailerService from './services/nodemailer.service';
import CacheService from './services/cache.service';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import getJwtConfig from './config/jwt.config';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule, CommonModule],
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<{ baseURL: string; maxBodyLength: number; headers: any }> => {
        const baseURL: string = configService.getOrThrow<string>('TMDB_URL');
        const token: string = configService.getOrThrow<string>('TMDB_TOKEN');

        return {
          baseURL,
          maxBodyLength: Infinity,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
      },
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        ttl: parseInt(configService.get('CACHE_TTL')), //Seconds
      }),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJwtConfig,
    }),
  ],
  providers: [EncryptService, NodemailerService, CacheService],
  exports: [
    EncryptService,
    NodemailerService,
    CacheService,
    HttpModule,
    JwtModule,
  ],
})
@Global()
export default class CommonModule {}
