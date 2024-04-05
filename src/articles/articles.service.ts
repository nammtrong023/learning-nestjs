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
import { PaginationRequest, PaginationResponse } from 'src/types';
import { DataNotFoundException } from 'src/exception/data-not-found';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<Article>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async create(
    userId: string,
    { categoryIds, ...createArticleDto }: CreateArticleDto,
  ) {
    if (!categoryIds) throw new BadRequestException('CategoryIds is required');

    const user = await this.userModel.findById(userId);
    if (!user) throw new DataNotFoundException('User', 'id', userId);

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
    return savedArticle.populate({
      path: 'categories',
      select: 'name',
    });
  }

  async findAll(
    pagination: PaginationRequest,
  ): Promise<PaginationResponse<Article>> {
    const { search } = pagination;
    const query = search
      ? {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } },
          ],
        }
      : {};
    return await this.articlePagination(pagination, query);
  }

  async findByCategoryId(categoryId: string, pagination: PaginationRequest) {
    const category = await this.categoryModel.findById(categoryId);
    if (!category)
      throw new DataNotFoundException('Category', 'id', categoryId);
    
    const query = { categories: categoryId };
    return await this.articlePagination(pagination, query);
  }

  async findByUserId(userId: string, pagination: PaginationRequest) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new DataNotFoundException('User', 'id', userId);

    const query = { user: userId };
    return await this.articlePagination(pagination, query);
  }

  async findOne(id: string) {
    const article = await this.articleModel.findById(id).populate({
      path: 'categories',
      select: 'name',
    });

    if (!article) throw new DataNotFoundException('Article', 'id', id);
    return article;
  }

  async update(id: string, userId: string, updateArticleDto: UpdateArticleDto) {
    if (!updateArticleDto.categoryIds) {
      throw new BadRequestException('CategoryIds is required');
    }
    await this.getAndFilterCategories(updateArticleDto.categoryIds);

    const article = await this.articleModel.findById(id);
    if (!article) throw new DataNotFoundException('Article', 'id', id);

    const owner = await this.userModel.findById(userId);
    if (!owner) throw new ForbiddenException('Do not have permission');

    return await article.updateOne(updateArticleDto, { new: true }).populate({
      path: 'categories',
      select: 'name',
    });
  }

  async remove(id: string, userId: string) {
    const owner = this.userModel.findById(userId);
    if (!owner) throw new ForbiddenException('Do not have permission');

    const article = await this.articleModel.findByIdAndDelete(id);
    if (!article) throw new BadRequestException(`Article not found: ${id}`);
  }

  async articlePagination(
    pagination: PaginationRequest,
    query?: any,
  ): Promise<PaginationResponse<Article>> {
    const { limit, page, sort } = pagination;
    const skip = (page - 1) * limit;

    const [articles, totalCount] = await Promise.all([
      this.articleModel
        .find({ ...query })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: sort || 'desc' })
        .populate([
          { path: 'user', select: 'username email' },
          {
            path: 'categories',
            select: 'name',
          },
        ]),
      this.articleModel.countDocuments(),
    ]);

    const totalPage = Math.ceil(totalCount / limit);
    return {
      data: articles,
      meta: { limit, page, totalPage },
    };
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
      throw new DataNotFoundException(
        'Categories',
        'ids',
        notFoundIds.join(', '),
      );
    }
  }
}
