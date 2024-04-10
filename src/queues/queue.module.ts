import { Module } from '@nestjs/common';
import { ProducerService } from './producer.service';
import { ConsumerService } from './consumer.service';
import { EmailService } from 'src/email/email.service';
import { ArticlesService } from 'src/articles/articles.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Article, ArticleSchema } from 'src/articles/schema/article.schema';
import { User, UserSchema } from 'src/users/schema/user.schema';
import {
  Category,
  CategorySchema,
} from 'src/categories/schema/category.schema';
import { UsersService } from 'src/users/users.service';
import { CategoriesService } from 'src/categories/categories.service';

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
  providers: [
    ProducerService,
    ConsumerService,
    EmailService,
    ArticlesService,
    UsersService,
    CategoriesService,
  ],
  exports: [ProducerService],
})
export class QueueModule {}
