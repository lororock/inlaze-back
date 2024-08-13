import { Module } from '@nestjs/common';
import UserAuthService from './user-auth.service';
import UserAuthController from './user-auth.controller';
import User from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserAuthController],
  providers: [UserAuthService, JwtModule],
  exports: [JwtModule],
})
export default class UsersModule {}
