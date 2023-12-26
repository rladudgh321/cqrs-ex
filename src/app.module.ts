import { Logger, MiddlewareConsumer, Module, NestMiddleware, NestModule } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AnalyticsModule } from './analytics/analytics.module';
import { UserModule } from './user/user.module';
import { VideoModule } from './video/video.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import postgresConfig from './config/postgres.config';
import jwtConfig from './config/jwt.config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { LoggerMiddleware } from './middleware/logger.middleware';
import swaggerConfig from './config/swagger.config';
import { ThrottlerModule } from '@nestjs/throttler';
import { HealthModule } from './health/health.module';
import sentryConfig from './config/sentry.config';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60 * 1000,
        limit: 10,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [postgresConfig, jwtConfig, swaggerConfig, sentryConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        let obj: TypeOrmModuleOptions = {
          type: 'postgres',
          host: configService.get('postgres.host'),
          port: configService.get('postgres.port'),
          username: configService.get('postgres.username'),
          password: configService.get('postgres.password'),
          database: configService.get('postgres.database'),
          autoLoadEntities: true,
        };
        if (configService.get('STAGE') === 'local') {
          obj = Object.assign(obj, { synchronize: true, logging: true });
        }
        return obj;
      },
    }),
    AuthModule,
    UserModule,
    VideoModule,
    AnalyticsModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    Logger,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
