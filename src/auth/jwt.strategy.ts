// import { ConfigService } from '@nestjs/config';
// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(readonly configService: ConfigService) {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       secretOrKey: configService.get('jwt.secret'),
//       ignoreExpiration: false,
//     });
//     console.log('+++++++++++++++++++++++++++++++++++++++++++++++JwtStrategy constructor called');
//   }

//   async validate(payload: any) {
//     console.log('********************************************************authStrategy 작동');
//     return { id: payload.sub };
//   }
// }

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret'),
    });
    console.log('+++++++++++++++++++++++++++++++++++++++++++++++JwtStrategy constructor called');
  }

  async validate(payload: any) {
    console.log('********************************************************authStrategy 작동');
    return { id: payload.sub };
  }
}
