import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriesService } from 'src/categories/categories.service';
import { UsersService } from 'src/users/users.service';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { Article, ArticleSchema } from './schema/article.schema';
import { User, UserSchema } from 'src/users/schema/user.schema';
import {
  Category,
  CategorySchema,
} from 'src/categories/schema/category.schema';
import { ProducerService } from 'src/queues/producer.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Article.name,
        schema: ArticleSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: Category.name,
        schema: CategorySchema,
      },
    ]),
  ],
  controllers: [ArticlesController],
  providers: [
    ArticlesService,
    UsersService,
    CategoriesService,
    ProducerService,
  ],
})
export class ArticlesModule {}
