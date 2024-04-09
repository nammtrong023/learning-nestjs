import { Module } from '@nestjs/common';
import { ProducerService } from './producer.service';
import { ConsumerService } from './consumer.service';
import { EmailService } from 'src/email/email.service';

@Module({
  providers: [ProducerService, ConsumerService, EmailService],
  exports: [ProducerService],
})
export class QueueModule {}
