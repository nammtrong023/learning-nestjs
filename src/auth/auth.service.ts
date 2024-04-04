import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { UserRepository } from 'src/users/repositories/user.repository';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload, Tokens } from 'types';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/schema/user.schema';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async signup(createDto: RegisterDto) {
    try {
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

      return newUser.save();
    } catch (error) {
      console.log(error);
      throw new HttpException('Internal server', 500);
    }
  }

  async login(data: LoginDto): Promise<Tokens> {
    const user = await this.userModel.findOne({
      email: data.email,
    });
    if (!user) {
      throw new UnauthorizedException('User not found with this email');
    }

    const verify = await compare(data.password, user.password);
    if (!verify) {
      throw new HttpException("Password doesn't correct", 400);
    }

    const tokens = await this.generateTokens(user.id, user.email);
    return tokens;
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<Tokens> {
    const user = await this.userModel.findOne({ _id: userId });

    if (!user || !user.refreshToken) throw new UnauthorizedException();

    const rtMatches = await compare(refreshToken, user.refreshToken);
    if (!rtMatches) throw new UnauthorizedException('Invalid token');

    const jwtPayload = {
      id: user.id,
      email: user.email,
    };
    const accessToken = await this.generateAtTokens(jwtPayload);
    return { accessToken, refreshToken };
  }

  async generateAtTokens(jwtPayload: JwtPayload) {
    return await this.jwtService.signAsync(jwtPayload, {
      secret: this.config.get<string>('AT_SECRET'),
      expiresIn: this.config.get<string>('EXP_AT'),
    });
  }

  async generateTokens(userId: string, email: string): Promise<Tokens> {
    const jwtPayload = {
      id: userId,
      email,
    };

    const accessToken = await this.generateAtTokens(jwtPayload);
    const refreshToken = await this.jwtService.signAsync(jwtPayload, {
      secret: this.config.get<string>('RT_SECRET'),
      expiresIn: this.config.get<string>('EXP_RT'),
    });

    return { accessToken, refreshToken };
  }
}