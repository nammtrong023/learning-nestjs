import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { DataNotFoundException } from 'src/exception/data-not-found';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  findAll() {
    return this.userModel.find({}, { password: 0 });
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new DataNotFoundException('User', 'id', id);
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    return user.updateOne(updateUserDto, { new: true });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.userModel.findByIdAndDelete(id);
  }
}
