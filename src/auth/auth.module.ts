import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AtStrategy } from './stragegies/at.strategy';
import { RtStrategy } from './stragegies/rt.strategy';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, JwtService, AtStrategy, RtStrategy],
})
export class AuthModule {}
