import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  fullName: string;

  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;
}
