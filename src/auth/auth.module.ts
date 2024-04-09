import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/schema/user.schema';
import { AtStrategy } from './stragegies/at.stragegy';
import { RtStrategy } from './stragegies/rt.stragegy';
import { ProducerService } from 'src/queues/producer.service';
import { QueueModule } from 'src/queues/queue.module';

@Module({
  imports: [
    JwtModule.register({}),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    QueueModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtService, AtStrategy, RtStrategy, ProducerService],
})
export class AuthModule {}
