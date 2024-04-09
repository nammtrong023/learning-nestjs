import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';
import { EMAIL_QUEUE } from 'src/common/constants/blog.constant';
import { MQ_CONNECTION } from 'src/config/connection-config';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class ConsumerService implements OnModuleInit {
  private channelWrapper: ChannelWrapper;
  private readonly logger = new Logger(ConsumerService.name);
  constructor(private emailService: EmailService) {
    const connection = amqp.connect([MQ_CONNECTION]);
    this.channelWrapper = connection.createChannel();
  }

  public async onModuleInit() {
    try {
      await this.channelWrapper.addSetup(async (channel: ConfirmChannel) => {
        await channel.assertQueue(EMAIL_QUEUE, { durable: true });

        await channel.consume(EMAIL_QUEUE, async (message) => {
          if (message) {
            const content = JSON.parse(message.content.toString());
            this.logger.log('Received message:', content);
            await this.emailService.sendEmail(content);
            channel.ack(message);
          }
        });
      });
      this.logger.log('Consumer service started and listening for messages.');
    } catch (err) {
      this.logger.error('Error starting the consumer:', err);
    }
  }
}
