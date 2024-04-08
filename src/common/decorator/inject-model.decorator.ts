import { InjectModel } from '@nestjs/mongoose';
import { Article } from 'src/articles/schema/article.schema';
import { Category } from 'src/categories/schema/category.schema';
import { User } from 'src/users/schema/user.schema';

export const InjectUserModel = () => InjectModel(User.name);
export const InjectArticleModel = () => InjectModel(Article.name);
export const InjectCategoryModel = () => InjectModel(Category.name);
