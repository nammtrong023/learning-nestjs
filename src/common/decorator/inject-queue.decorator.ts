import { InjectQueue } from '@nestjs/bullmq';
import { IMPORT_ARTICLES_QUEUE } from '../constants/blog.constant';

export const InjectImportArticlesQueue = () =>
  InjectQueue(IMPORT_ARTICLES_QUEUE);
