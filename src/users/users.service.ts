import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { DataNotFoundException } from 'src/exception/data-not-found';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userModel.find({}, { password: 0 });

    return users.map((user) => UserResponseDto.fromUser(user));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userModel.findById(id);
    if (!user) throw new DataNotFoundException('User', 'id', id);
    return UserResponseDto.fromUser(user);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.userModel.findById(id, updateUserDto, {
      new: true,
    });
    if (!user) throw new DataNotFoundException('User', 'id', id);

    return UserResponseDto.fromUser(user);
  }

  async findUserDocument(userId: string) {
    return await this.userModel.findById(userId);
  }

  async remove(id: string) {
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) throw new DataNotFoundException('User', 'id', id);
  }
}
