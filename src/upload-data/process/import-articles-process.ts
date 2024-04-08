import { Processor } from '@nestjs/bullmq';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { WorkerHostProcessor } from './worker-host.process';
import { Article } from 'src/articles/schema/article.schema';
import { Model } from 'mongoose';
import { ArticleImportDto } from '../dto/article-import.dto';
import { IMPORT_ARTICLES_QUEUE } from 'src/common/constants/blog.constant';
import { InjectArticleModel } from 'src/common/decorator/inject-model.decorator';
import { ObjectResponse } from 'src/responses/data-response';

@Processor(IMPORT_ARTICLES_QUEUE)
@Injectable()
export class ImportArticlesProcess extends WorkerHostProcessor {
  constructor(@InjectArticleModel() private articleModel: Model<Article>) {
    super();
  }
  protected readonly logger = new Logger(ImportArticlesProcess.name);

  async process(
    job: Job<ArticleImportDto[], any, any>,
  ): Promise<ObjectResponse<any>> {
    if (!job || !job.data) {
      throw new HttpException('Job or job data is missing', 500);
    }

    try {
      const newData = job.data.map((item) => {
        const categoryIdsArray = item.categoryIds
          .split(',')
          .map((id) => id.trim());
        return {
          ...item,
          categories: categoryIdsArray,
        };
      });
      await this.articleModel.insertMany(newData);
    } catch (error) {
      this.logger.error('Error logging job data: ', error);
      throw new HttpException('Error logging job data', 500);
    }

    return { message: 'Import data successfully', statusCode: 200 };
  }
}
