import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
export class ArticleImportDto {
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
    example: '1',
    required: true,
  })
  @IsNotEmpty()
  categoryIds: string;
}
