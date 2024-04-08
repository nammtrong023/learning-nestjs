import { Module } from '@nestjs/common';
import { UploadDataController } from './upload-data.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Article, ArticleSchema } from 'src/articles/schema/article.schema';
import { BullModule } from '@nestjs/bullmq';
import { ImportArticlesProcess } from './process/import-articles-process';
import { IMPORT_ARTICLES_QUEUE } from 'src/common/constants/blog.constant';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Article.name,
        schema: ArticleSchema,
      },
    ]),
    BullModule.registerQueue({
      name: IMPORT_ARTICLES_QUEUE,
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
  controllers: [UploadDataController],
  providers: [ImportArticlesProcess],
})
export class UploadDataModule {}
