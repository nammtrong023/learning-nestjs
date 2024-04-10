import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { Channel } from 'amqplib';
import {
  EMAIL_QUEUE,
  IMPORT_ARTICLES_QUEUE,
} from 'src/common/constants/blog.constant';
import { MQ_CONNECTION } from 'src/config/connection-config';
import { QueueConfig } from 'src/types';

@Injectable()
export class ProducerService {
  private channelWrapper: ChannelWrapper;
  private readonly queues: QueueConfig[] = [
    { name: EMAIL_QUEUE, options: { durable: true } },
    { name: IMPORT_ARTICLES_QUEUE, options: { durable: true } },
  ];
  constructor() {
    const connection = amqp.connect([MQ_CONNECTION]);
    this.channelWrapper = connection.createChannel({
      setup: async (channel: Channel) => {
        for (const queue of this.queues) {
          await channel.assertQueue(queue.name, queue.options);
        }
      },
    });
  }

  async addToQueue(queueName: string, content: any) {
    try {
      await this.channelWrapper.sendToQueue(
        queueName,
        Buffer.from(JSON.stringify(content)),
        { persistent: true },
      );
      Logger.log('Sent To Queue');
    } catch (error) {
      throw new HttpException(
        'Error sending to queue',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
