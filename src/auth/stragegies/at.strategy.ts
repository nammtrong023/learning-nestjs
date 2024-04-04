import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtPayload, JwtPayloadWithAtToken } from 'types';
import { BaseJwtStrategy } from './base.strategy';

@Injectable()
export class AtStrategy extends BaseJwtStrategy {
  constructor(config: ConfigService) {
    super(config, 'AT_SECRET', 'jwt');
  }

  validate(request: Request, payload: JwtPayload): JwtPayloadWithAtToken {
    const accessToken = request
      ?.get('authorization')
      ?.replace('Bearer', '')
      .trim();

    if (!accessToken) throw new ForbiddenException('Access token malformed');

    return {
      ...payload,
      accessToken,
    };
  }
}
