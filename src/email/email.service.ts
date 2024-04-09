import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

interface EmailOptions {
  email: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}
  async sendEmail(options: EmailOptions) {
    try {
      await this.mailerService.sendMail({
        to: options.email,
        subject: options.subject,
        html: options.html,
      });
    } catch (error) {
      console.log('Email', error);
      throw new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
