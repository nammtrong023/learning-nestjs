import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: "Category's name",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
