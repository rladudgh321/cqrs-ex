import { SentryInterceptor } from './common/interceptors/sentry.interseptor';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { WinstonModule, utilities } from 'nest-winston';
import * as Winston from 'winston';
import { TransformInterceptor } from './common/interceptors/transform.inceptor';
import { ConfigService } from '@nestjs/config';
import * as basicAuth from 'express-basic-auth';
import * as Sentry from '@sentry/node';

async function bootstrap() {
  const port = 3000;
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new Winston.transports.Console({
          level: process.env.STATE === 'prod' ? 'info' : 'debug',
          format: Winston.format.combine(
            Winston.format.timestamp(),
            utilities.format.nestLike('NestJs', { prettyPrint: true }),
          ),
        }),
      ],
    }),
  });

  const configService = app.get(ConfigService);
  const stage = configService.get('STAGE');

  // Swagger
  const SWAGGER_ENVS = ['local', 'dev'];

  if (SWAGGER_ENVS.includes(stage)) {
    app.use(
      ['/docs', '/docs-json'],
      basicAuth({
        challenge: true,
        users: {
          [configService.get('swagger.user')]: configService.get('swagger.password'),
        },
      }),
    );
    const config = new DocumentBuilder()
      .setTitle('NestJS project')
      .setDescription('NestJS project API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    const swaggerCustomOptions: SwaggerCustomOptions = {
      swaggerOptions: {
        persistAuthorization: true,
      },
    };
    SwaggerModule.setup('docs', app, document, swaggerCustomOptions);
  }

  // ValidationPipe 전역 적용
  app.useGlobalPipes(
    new ValidationPipe({
      // class-transformer 적용
      transform: true,
    }),
  );

  Sentry.init({ dsn: configService.get('sentry.dsn') });
  app.useGlobalInterceptors(new SentryInterceptor(), new TransformInterceptor());

  await app.listen(port);
  Logger.log(`STAGE=${process.env.STAGE}`);
  Logger.log(`listening on port ${port}`);
}
bootstrap();
