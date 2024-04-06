import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';
import { IsObjectId } from 'nestjs-object-id';
export class CreateArticleDto {
  @ApiProperty({
    example: 'My title',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'My content',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    example: ['1', '2'],
    required: true,
  })
  @IsArray()
  @IsNotEmpty()
  @IsObjectId({ each: true })
  @ArrayMinSize(1)
  categoryIds: string[];
}
