import { Inject, Injectable, Logger, LoggerService, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(@Inject(Logger) private readonly loggerService: LoggerService) {}
  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl: url, ip } = req;
    const userAgent = req.get('user-agent');
    res.on('close', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      this.loggerService.log(`${method} ${url} ${statusCode} ${contentLength} ${userAgent} ${ip}`);
    });

    next();
  }
}
