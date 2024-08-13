import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import User from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import EncryptService from '../common/services/encrypt.service';
import RegisterUserDto from './dto/register-user.dto';
import { ERROR } from '../common/utils/messages.util';
import { JwtService } from '@nestjs/jwt';
import NodemailerService from '../common/services/nodemailer.service';
import registerConfirmEmail from '../common/templates/mails/register-confirm.email';
import { ConfigService } from '@nestjs/config';
import CacheService from '../common/services/cache.service';
import generateNumberCodeUtil from '../common/utils/generate-number-code.util';
import resetPasswordEmail from '../common/templates/mails/reset-password.email';

@Injectable()
export default class UserAuthService {
  private readonly logger = new Logger(UserAuthService.name);

  private readonly urlApp: string;

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly encryptService: EncryptService,
    private readonly jwtService: JwtService,
    private readonly nodemailerService: NodemailerService,
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
  ) {
    this.urlApp = this.configService.getOrThrow<string>('APP_CLIENT_URL');
  }

  public findUser = async (key: 'email' | 'id', value: string) => {
    let user: User;
    try {
      user = await this.userRepository.findOne({ where: { [key]: value } });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(ERROR.INTERNAL);
    }

    if (!user) throw new NotFoundException(ERROR.NOT_FOUND);
    return user;
  };

  public register = async ({ email, password }: RegisterUserDto) => {
    password = this.encryptService.encrypt(password);

    let userFound: User;
    try {
      userFound = await this.findUser('email', email);
    } catch (error) {}
    if (userFound) throw new ConflictException(ERROR.ALREADY_EXISTS);

    let user = this.userRepository.create({ email, password });

    try {
      user = await this.userRepository.save(user);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(ERROR.INTERNAL);
    }

    try {
      const token = await this.jwtService.signAsync({ id: user.id });
      const url = `${this.urlApp}?verify/${token}`;
      await this.nodemailerService.main({
        from: 'Registro exitoso <noreply_inlaze@gmail.com>',
        to: email,
        subject: 'Registro en INLAZE',
        html: registerConfirmEmail(url),
      });
      return { message: 'Se envío un correo para confirmar registro' };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(ERROR.INTERNAL);
    }
  };

  public login = async ({ email, password }: RegisterUserDto) => {
    let user: User;
    try {
      user = await this.userRepository.findOne({
        where: { email },
        select: ['id', 'email', 'password', 'isActive'],
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(ERROR.INTERNAL);
    }

    if (!user) throw new UnauthorizedException(ERROR.INVALID_CREDENTIALS);
    if (!user.isActive) throw new UnauthorizedException('Cuenta inactiva');

    let decryptPassword: string;
    try {
      decryptPassword = this.encryptService.decrypt(user.password);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(ERROR.INTERNAL);
    }

    if (decryptPassword === '') {
      this.logger.error('Llave de encriptación es errada');
      throw new InternalServerErrorException(ERROR.INTERNAL);
    }
    if (password !== decryptPassword)
      throw new UnauthorizedException(ERROR.INVALID_CREDENTIALS);

    try {
      const token = await this.jwtService.signAsync({ id: user.id });
      const refreshToken = await this.generateRefreshToken(user.id);

      return { token, refreshToken };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(ERROR.INTERNAL);
    }
  };

  public confirm = async (token: string) => {
    let id: string;
    try {
      const payload = await this.jwtService.verifyAsync(token);

      id = payload.id;
    } catch (error) {
      this.logger.error(error);
      throw new ConflictException(ERROR.INVALID_CREDENTIALS);
    }

    const user = await this.findUser('id', id);
    if (user.isActive) return { message: 'Usuario ya activo' };

    const userPreload = await this.userRepository.preload({ id });

    userPreload.isActive = true;

    try {
      await this.userRepository.save(userPreload);
      return { message: 'Usuario confirmado' };
    } catch (error) {
      this.logger.error(error);
      throw new ConflictException(ERROR.INVALID_CREDENTIALS);
    }
  };

  public requestResetPassword = async (email: string) => {
    const user = await this.findUser('email', email);

    let token: string;
    const code = generateNumberCodeUtil(6);
    try {
      token = await this.jwtService.signAsync({ id: user.id, code });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(ERROR.INTERNAL);
    }

    const url = `${this.urlApp}reset-password/${token}`;

    await this.cacheService.set(user.id, code);

    await this.nodemailerService.main({
      from: 'Restablecer contraseña <noreply_inlaze@gmail.com>',
      to: email,
      subject: 'Restablecer contraseña en INLAZE',
      html: resetPasswordEmail(url),
    });

    return { message: 'Revisa tu correo para restablecer tu contraseña' };
  };

  public resetPassword = async (id: string, code: string, password: string) => {
    const codeFound = await this.cacheService.get(id);

    if (!codeFound)
      throw new BadRequestException(
        `Código no encontrado o expirado, vuelve a solicitar uno`,
      );

    if (codeFound !== code)
      throw new BadRequestException(
        `${ERROR.BAD_REQUEST}, el código en la solicitud es incorrecto`,
      );

    const userPreload = await this.userRepository.preload({ id });

    try {
      userPreload.password = this.encryptService.encrypt(password);
      await this.userRepository.save(userPreload);

      await this.cacheService.del(id);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(ERROR.INTERNAL);
    }

    return { message: 'Contraseña actualizada correctamente' };
  };

  private generateRefreshToken = async (id: string) =>
    this.jwtService.sign(
      { id },
      {
        expiresIn: '7d',
      },
    );

  public refreshAndValidateToken = async (refreshToken: string) => {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);

      const token = await this.jwtService.signAsync({ id: payload.id });

      const newRefreshToken = await this.generateRefreshToken(payload.id);
      return { token, refreshToken: newRefreshToken };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(ERROR.INTERNAL);
    }
  };
}
