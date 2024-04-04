import { IsArray, IsInt, IsNotEmpty } from 'class-validator';

export class PaginationResponseDto<T> {
  @IsNotEmpty()
  @IsArray()
  data: T[];

  @IsInt()
  limit: number;

  @IsInt()
  page: number;

  @IsInt()
  totalPage: number;
}
