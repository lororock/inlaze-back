import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import UserAuthService from './user-auth.service';
import RegisterUserDto from './dto/register-user.dto';
import { isEmail } from 'class-validator';
import { ERROR } from '../common/utils/messages.util';
import ChangePasswordDto from './dto/change-password.dto';
import AuthGuard from './guards/auth.guard';
import { Request as Req } from 'express';
import { ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('auth')
export default class UserAuthController {
  constructor(private readonly usersService: UserAuthService) {}

  @Post('register')
  public async register(@Body() dto: RegisterUserDto) {
    return this.usersService.register(dto);
  }

  @Post('confirm/:token')
  public async confirm(@Param('token') token: string) {
    return this.usersService.confirm(token);
  }

  @Post('login')
  public async login(@Body() dto: RegisterUserDto) {
    return this.usersService.login(dto);
  }

  @Post('request-reset-password')
  public async requestResetPassword(@Body() { email }: any) {
    if (!isEmail(email)) throw new BadRequestException(ERROR.BAD_REQUEST);
    return this.usersService.requestResetPassword(email);
  }

  @UseGuards(AuthGuard)
  @Post('reset-password')
  public async resetPassword(
    @Request() req: Req,
    @Body() { password, passwordConfirm }: ChangePasswordDto,
  ) {
    if (password !== passwordConfirm)
      throw new BadRequestException('Las contraseñas no coinciden');

    const { id, code } = req['user'];

    if (!code) throw new BadRequestException(ERROR.BAD_REQUEST);

    return await this.usersService.resetPassword(id, code, password);
  }

  @UseGuards(AuthGuard)
  @Post('refresh-token')
  public validRefreshToken(@Param('token') token: string) {
    return this.usersService.refreshAndValidateToken(token);
  }
}
