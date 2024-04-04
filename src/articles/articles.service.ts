import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Article } from './schema/article.schema';
import { Model } from 'mongoose';
import { User } from 'src/users/schema/user.schema';
import { Category } from 'src/categories/schema/category.schema';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<Article>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async create({ userId, categoryIds, ...createArticleDto }: CreateArticleDto) {
    if (!categoryIds) throw new BadRequestException('CategoryIds is required');

    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException('User Not Found');

    this.getAndFilterCategories(categoryIds);

    const newArticle = new this.articleModel({
      ...createArticleDto,
      user: userId,
      categories: categoryIds,
    });

    const savedArticle = await newArticle.save();
    await user.updateOne({
      $push: {
        articles: savedArticle._id,
      },
    });

    await this.categoryModel.updateMany(
      {
        _id: { $in: categoryIds },
      },
      {
        $push: {
          article: savedArticle._id,
        },
      },
    );
    return savedArticle.populate(['categories']);
  }

  async findAll() {
    return await this.articleModel.find().populate(['user', 'categories']);
  }

  async findOne(id: string) {
    const article = await this.articleModel
      .findById(id)
      .populate(['categories']);

    if (!article) throw new BadRequestException(`Article not found: ${id}`);
    return article;
  }

  async update(id: string, updateArticleDto: UpdateArticleDto) {
    if (!updateArticleDto.categoryIds)
      throw new BadRequestException('CategoryIds is required');

    await this.getAndFilterCategories(updateArticleDto.categoryIds);

    const owner = await this.userModel.findById(updateArticleDto.userId);
    if (!owner) throw new ForbiddenException('Do not have permission');

    const article = await this.articleModel
      .findByIdAndUpdate(id, updateArticleDto, {
        new: true,
      })
      .populate(['categories']);

    if (!article) throw new BadRequestException(`Article not found: ${id}`);
    return article;
  }

  async remove(id: string) {
    // const owner = this.userModel.findById(updateArticleDto.userId);
    // if (!owner) throw new ForbiddenException('Do not have permission');
    const article = await this.articleModel.findByIdAndDelete(id);
    if (!article) throw new BadRequestException(`Article not found: ${id}`);
  }

  async getAndFilterCategories(categoryIds: string[]) {
    const categories = await this.categoryModel.find({
      _id: {
        $in: categoryIds,
      },
    });

    if (categories.length !== categoryIds.length) {
      const notFoundIds = categoryIds.filter(
        (id) => !categories.some((cat) => cat._id.equals(id)),
      );
      throw new BadRequestException(
        `Categories Not Found: ${notFoundIds.join(', ')}`,
      );
    }
  }
}
