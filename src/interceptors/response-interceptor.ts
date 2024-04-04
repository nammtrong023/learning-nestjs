import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  InternalServerErrorException,
} from '@nestjs/common';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable()
export class ResponseDto<T extends object> implements NestInterceptor<any, T> {
  constructor(private readonly dto: new () => T) {}

  intercept(_: ExecutionContext, next: CallHandler): Observable<T> {
    return next.handle().pipe(
      switchMap(async (data) => {
        const transformedData = plainToInstance(
          this.dto,
          instanceToPlain(data),
        );
        const errors = await validate(transformedData);

        if (errors.length > 0) {
          throw new InternalServerErrorException({
            message: 'Response validation failed',
            errors,
          });
        }
        return transformedData;
      }),
    );
  }
}
