import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { UserResponseDto } from 'src/users/dto/responses/user-response.dto';
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
    const articleResponseDto = new ArticleResponseDto();
    articleResponseDto.title = article.title;
    articleResponseDto.content = article.content;
    articleResponseDto.user = article.user;
    articleResponseDto.categoryIds = article.categories;
    return articleResponseDto;
  }

  static fromArticles(articles: Article[]): ArticleResponseDto[] {
    return articles.map((article) => this.fromArticle(article));
  }
}
