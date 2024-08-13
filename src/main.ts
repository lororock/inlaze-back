import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:5173', // URL de tu frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const configService = new ConfigService(app);
  const port = configService.getOrThrow<string>('APP_PORT');

  const config = new DocumentBuilder()
    .setTitle('Documentación InLaze Backend')
    .setDescription('Gestión de usuarios y películas')
    .setVersion('1.0')
    .setContact(
      'Cristhian Rosas',
      'https://github.com/lororock',
      'lororock159@gmail.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('documentation', app, document);

  await app.listen(port);
  Logger.debug(`Running application at http://localhost:${port}/`);
};

(async () => {
  await bootstrap();
})();
