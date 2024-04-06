import { IsNotEmpty, IsString } from 'class-validator';
import { User } from '../schema/user.schema';

export class UserResponseDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  static fromUser(user: User): UserResponseDto {
    return {
      fullName: user.fullName,
      username: user.username,
      email: user.email,
    };
  }
}
