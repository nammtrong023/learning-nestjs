import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Article } from 'src/articles/schema/article.schema';

@Schema()
export class User {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  username: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false })
  bio: string;

  @Prop({ required: false })
  avatar: string;

  @Prop({ required: false })
  refreshToken: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }] })
  articles: Article[];
}

export const UserSchema = SchemaFactory.createForClass(User);
