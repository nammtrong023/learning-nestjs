import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards
} from '@nestjs/common';
import { GetCurrentUser } from 'src/common/decorator/get-current-user';
import { GetCurrentUserId } from 'src/common/decorator/get-current-user-id';
import { Public } from 'src/common/decorator/public.decorator';
import { RtGuard } from 'src/common/guard/rt.guard';
import { Tokens } from 'types';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() body: RegisterDto): Promise<void> {
    return this.authService.signup(body);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() body: LoginDto): Promise<Tokens> {
    return this.authService.login(body);
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ): Promise<Tokens> {
    return this.authService.refreshTokens(userId, refreshToken);
  }

  // @Public()
  // @Post('reset-password')
  // @HttpCode(HttpStatus.OK)
  // resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<Tokens> {
  //   return this.authService.resetPassword(resetPasswordDto);
  // }
}
