import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { UserResponseDto } from 'src/users/dto/user-response.dto';
import { Article } from '../schema/article.schema';
import { Category } from 'src/categories/schema/category.schema';

export class ArticleResponseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  user: UserResponseDto;

  @IsArray()
  @IsNotEmpty()
  categoryIds: Category[];

  static fromArticle(article: Article): ArticleResponseDto {
    return {
      title: article.title,
      content: article.content,
      user: article.user,
      categoryIds: article.categories,
    };
  }
}
