import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';
export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  @ArrayMinSize(1)
  categoryIds: string[];
}
