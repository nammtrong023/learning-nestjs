import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtPayload, JwtPayloadWithRtToken } from 'types';
import { BaseJwtStrategy } from './base.strategy';

@Injectable()
export class RtStrategy extends BaseJwtStrategy {
  constructor(config: ConfigService) {
    super(config, 'RT_SECRET', 'jwt-refresh');
  }

  validate(request: Request, payload: JwtPayload): JwtPayloadWithRtToken {
    const refreshToken = request
      ?.get('authorization')
      ?.replace('Bearer', '')
      .trim();

    if (!refreshToken) throw new ForbiddenException('Refresh token malformed');

    return {
      ...payload,
      refreshToken,
    };
  }
}
