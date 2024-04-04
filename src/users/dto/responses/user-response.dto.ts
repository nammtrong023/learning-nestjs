import { IsNotEmpty, IsString } from 'class-validator';

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
}
