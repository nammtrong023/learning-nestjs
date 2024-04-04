import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayloadWithTokens } from 'src/types';

export const GetCurrentUser = createParamDecorator(
  (data: keyof JwtPayloadWithTokens | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    if (!data) return request.user;
    return request.user[data];
  },
);
