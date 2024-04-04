import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Article } from 'src/articles/schema/article.schema';

@Schema()
export class Category {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
      },
    ],
  })
  article: Article[];
}

export const CategorySchema = SchemaFactory.createForClass(Category);
