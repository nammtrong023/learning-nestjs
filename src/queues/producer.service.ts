import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { Channel } from 'amqplib';
import { EMAIL_QUEUE } from 'src/common/constants/blog.constant';
import { MQ_CONNECTION } from 'src/config/connection-config';

@Injectable()
export class ProducerService {
  private channelWrapper: ChannelWrapper;
  constructor() {
    const connection = amqp.connect([MQ_CONNECTION]);
    this.channelWrapper = connection.createChannel({
      setup: (channel: Channel) => {
        return channel.assertQueue(EMAIL_QUEUE, { durable: true });
      },
    });
  }

  async addToEmailQueue(mail: any) {
    try {
      await this.channelWrapper.sendToQueue(
        EMAIL_QUEUE,
        Buffer.from(JSON.stringify(mail)),
        { persistent: true },
      );
      Logger.log('Sent To Queue');
    } catch (error) {
      throw new HttpException(
        'Error adding mail to queue',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
