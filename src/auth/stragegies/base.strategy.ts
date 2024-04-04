import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from 'types';

export abstract class BaseJwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    secretConfigKey: string,
    strategyName: string = 'jwt',
  ) {
    super(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: config.get<string>(secretConfigKey),
        passReqToCallback: true,
      },
      strategyName,
    );
  }

  abstract validate(req: Request, payload: JwtPayload): JwtPayload;
}
