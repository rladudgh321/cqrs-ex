import { ExecutionContext, Inject, Injectable, Logger, LoggerService, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { PUBLIC_KEY } from 'src/common/decorators/public.decorator';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { IS_ROLE_KEY } from 'src/common/decorators/role.decorator';
import { UserService } from 'src/user/user.service';
import { Role } from 'src/user/enum/user.enum';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    @Inject(Logger) private readonly logger: LoggerService,
  ) {
    super();
  }
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (isPublic) {
      return true;
    }

    const { headers, url } = context.switchToHttp().getRequest<Request>();
    const token = /Bearer\s(.+)/.exec(headers['authorization'])[1];
    const decoded = this.jwtService.decode(token);

    if (url !== '/api/auth/refresh' && decoded['tokenType'] === 'refresh') {
      const error = new UnauthorizedException('accessToken is required!!');
      this.logger.error(error.message, error.stack);
      throw error;
    }

    const requiredAdmin = this.reflector.getAllAndOverride<Role[]>(IS_ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (requiredAdmin) {
      const userId = decoded['sub'];
      console.log('decoded', decoded);
      return this.userService.checkAdminUser(userId);
    }

    return super.canActivate(context);
  }
}
