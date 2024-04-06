import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Article } from './schema/article.schema';
import { Model } from 'mongoose';
import { PaginationRequest, PaginationResponse } from 'src/types';
import { DataNotFoundException } from 'src/exception/data-not-found';
import { UsersService } from 'src/users/users.service';
import { CategoriesService } from 'src/categories/categories.service';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<Article>,
    private userSerive: UsersService,
    private categoriesService: CategoriesService,
  ) {}

  async create(
    userId: string,
    { categoryIds, ...createArticleDto }: CreateArticleDto,
  ): Promise<Article> {
    if (!categoryIds) throw new BadRequestException('CategoryIds is required');

    const user = await this.userSerive.findUserDocument(userId);
    if (!user) throw new DataNotFoundException('User', 'id', userId);

    this.categoriesService.filterCategoryIds(categoryIds);
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

    await this.categoriesService.updateMany(savedArticle.id, categoryIds);
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

  async findByCategoryId(
    categoryId: string,
    pagination: PaginationRequest,
  ): Promise<PaginationResponse<Article>> {
    await this.categoriesService.findOne(categoryId);
    const query = { categories: categoryId };
    return await this.articlePagination(pagination, query);
  }

  async findByUserId(
    userId: string,
    pagination: PaginationRequest,
  ): Promise<PaginationResponse<Article>> {
    await this.userSerive.findOne(userId);

    const query = { user: userId };
    return await this.articlePagination(pagination, query);
  }

  async findOne(id: string): Promise<Article> {
    const article = await this.articleModel.findById(id).populate({
      path: 'categories',
      select: 'name',
    });

    if (!article) throw new DataNotFoundException('Article', 'id', id);
    return article;
  }

  async update(
    id: string,
    userId: string,
    updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    if (!updateArticleDto.categoryIds) {
      throw new BadRequestException('CategoryIds is required');
    }
    await this.categoriesService.filterCategoryIds(
      updateArticleDto.categoryIds,
    );

    const article = await this.articleModel.findById(id);
    if (!article) throw new DataNotFoundException('Article', 'id', id);

    await this.userSerive.findOne(userId);
    await article.updateOne(updateArticleDto, { new: true }).populate({
      path: 'categories',
      select: 'name',
    });

    return article;
  }

  async remove(id: string, userId: string) {
    await this.userSerive.findOne(userId);

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
}
