import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';
import { ArticlesService } from 'src/articles/articles.service';
import {
  EMAIL_QUEUE,
  IMPORT_ARTICLES_QUEUE,
} from 'src/common/constants/blog.constant';
import { MQ_CONNECTION } from 'src/config/connection-config';
import { EmailService } from 'src/email/email.service';
import { QueueConfig } from 'src/types';
import { ArticleImportDto } from 'src/upload-data/dto/article-import.dto';

@Injectable()
export class ConsumerService implements OnModuleInit {
  private channelWrapper: ChannelWrapper;
  private readonly logger = new Logger(ConsumerService.name);

  private readonly queues: QueueConfig[] = [
    { name: EMAIL_QUEUE, options: { durable: true } },
    { name: IMPORT_ARTICLES_QUEUE, options: { durable: true } },
  ];

  constructor(
    private emailService: EmailService,
    private aritclesService: ArticlesService,
  ) {
    const connection = amqp.connect([MQ_CONNECTION]);
    this.channelWrapper = connection.createChannel();
  }

  async onModuleInit() {
    try {
      await this.channelWrapper.addSetup(async (channel: ConfirmChannel) => {
        for (const queue of this.queues) {
          await channel.assertQueue(queue.name, queue.options);
          await this.consumeFromQueue(channel, queue.name);
        }
      });
      this.logger.log('Consumer service started and listening for messages.');
    } catch (err) {
      this.logger.error('Error starting the consumer:', err);
    }
  }

  private async consumeFromQueue(channel: ConfirmChannel, queueName: string) {
    await channel.consume(queueName, async (message) => {
      if (message) {
        const content = JSON.parse(message.content.toString());
        this.logger.log(`Received message from ${queueName}:`, content);

        switch (queueName) {
          case EMAIL_QUEUE:
            await this.handleEmailMessage(content);
            break;
          case IMPORT_ARTICLES_QUEUE:
            await this.handleImportArticlesMessage(content);
            break;
          default:
            this.logger.warn(
              `Received message from unknown queue: ${queueName}`,
            );
            break;
        }
        channel.ack(message);
      }
    });
  }

  private async handleEmailMessage(content: any) {
    await this.emailService.sendEmail(content);
  }

  private async handleImportArticlesMessage(content: ArticleImportDto[]) {
    await this.aritclesService.insertMany(content);
  }
}
