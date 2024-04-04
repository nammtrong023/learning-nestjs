import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class PaginationRequest {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sort?: 'asc' | 'desc';
}
