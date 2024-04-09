import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { Tokens } from 'src/types';
import { Model } from 'mongoose';
import { User } from 'src/users/schema/user.schema';
import { LoginDto } from './dto/login.dto';
import { DataNotFoundException } from 'src/exception/data-not-found';
import { InjectUserModel } from 'src/common/decorator/inject-model.decorator';
import { ProducerService } from 'src/queues/producer.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectUserModel() private userModel: Model<User>,
    private producerService: ProducerService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async signup(createDto: RegisterDto) {
    const user = await this.userModel.findOne({
      email: createDto.email,
    });

    if (user) {
      throw new HttpException('This email has been used.', 400);
    }

    const hashedPassword = await hash(createDto.password, 10);
    const newUser = new this.userModel({
      ...createDto,
      password: hashedPassword,
    });
    newUser.save();

    const emailData = {
      email: newUser.email,
      subject: 'Welcome to Our Community',
      html: `<p>Hi ${newUser.username},</p>
      <p>Your account is now active.</p>`,
    };

    await this.producerService.addToEmailQueue(emailData);
    return new HttpException('An email has been sent', 201);
  }

  async login(data: LoginDto): Promise<Tokens> {
    const user = await this.userModel.findOne({
      email: data.email,
    });
    if (!user) {
      throw new DataNotFoundException('User', 'email', data.email);
    }

    const verify = await compare(data.password, user.password);
    if (!verify) {
      throw new HttpException("Password doesn't correct", 400);
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRtToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async refreshToken(userId: string, refreshToken: string): Promise<Tokens> {
    const user = await this.userModel.findById(userId);
    if (!user || !user.refreshToken) throw new UnauthorizedException();

    const rtMatches = await compare(refreshToken, user.refreshToken);
    if (!rtMatches) throw new UnauthorizedException('Invalid token');

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRtToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async updateRtToken(userId: string, refreshToken: string): Promise<void> {
    const hashedRtToken = await hash(refreshToken, 10);

    await this.userModel.findByIdAndUpdate(
      userId,
      {
        refreshToken: hashedRtToken,
      },
      { new: true },
    );
  }
  async generateTokens(userId: string, email: string): Promise<Tokens> {
    const jwtPayload = {
      id: userId,
      email,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('AT_SECRET'),
        expiresIn: this.config.get<string>('EXP_AT'),
      }),

      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('RT_SECRET'),
        expiresIn: this.config.get<string>('EXP_RT'),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
