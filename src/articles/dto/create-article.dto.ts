import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';
import { IsObjectId } from 'nestjs-object-id';
export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsArray()
  @IsNotEmpty()
  @IsObjectId({ each: true })
  @ArrayMinSize(1)
  categoryIds: string[];
}
