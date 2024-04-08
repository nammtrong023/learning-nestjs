import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Model } from 'mongoose';
import { Category } from './schema/category.schema';
import { PaginationRequest } from 'src/types';
import { DataNotFoundException } from 'src/exception/data-not-found';
import { InjectCategoryModel } from 'src/common/decorator/inject-model.decorator';

@Injectable()
export class CategoriesService {
  constructor(@InjectCategoryModel() private categoryModel: Model<Category>) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const category = new this.categoryModel(createCategoryDto);

    return await category.save();
  }

  async findAll(pagination: PaginationRequest) {
    const { limit, page, search } = pagination;
    const skip = (page - 1) * limit;

    const query = search
      ? {
          name: { $regex: search, $options: 'i' },
        }
      : {};
    const [categories, totalCount] = await Promise.all([
      this.categoryModel
        .find({ ...query })
        .skip(skip)
        .limit(limit),
      this.categoryModel.countDocuments(),
    ]);

    const totalPage = Math.ceil(totalCount / limit);

    return {
      data: categories,
      meta: { limit, page, totalPage },
    };
  }

  async filterCategoryIds(categoryIds: string[]): Promise<void> {
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

  async findOne(id: string) {
    const category = await this.categoryModel.findById(id);
    if (!category) throw new DataNotFoundException('Category', 'id', id);
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryModel.findByIdAndUpdate(
      id,
      updateCategoryDto,
      { new: true },
    );
    if (!category) throw new DataNotFoundException('Category', 'id', id);

    return category;
  }

  async updateMany(articleId: string, categoryIds: string[]): Promise<void> {
    await this.categoryModel.updateMany(
      {
        _id: { $in: categoryIds },
      },
      {
        $push: {
          article: articleId,
        },
      },
    );
  }

  async remove(id: string): Promise<void> {
    const category = await this.categoryModel.findByIdAndDelete(id);
    if (!category) throw new DataNotFoundException('Category', 'id', id);
  }
}
