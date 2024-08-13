import { JwtModuleOptions } from '@nestjs/jwt/dist/interfaces/jwt-module-options.interface';
import { ConfigService } from '@nestjs/config';
const getJwtConfig = async (
  configService: ConfigService,
): Promise<JwtModuleOptions> => ({
  secret: configService.getOrThrow<string>('JWT_SECRET'),
  signOptions: {
    expiresIn: configService.getOrThrow<string>('JWT_EXPIRES_IN'),
  },
});

export default getJwtConfig;
