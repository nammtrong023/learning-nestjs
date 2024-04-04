import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/schema/user.schema';
import { ConfigService } from '@nestjs/config';
import { AtStrategy } from './stragegies/at.stragegy';
import { RtStrategy } from './stragegies/rt.stragegy';

@Module({
  imports: [
    JwtModule.register({}),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, ConfigService, JwtService, AtStrategy, RtStrategy],
})
export class AuthModule {}
