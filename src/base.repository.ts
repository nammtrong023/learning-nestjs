import { Model, FilterQuery, QueryOptions } from 'mongoose';

export class BaseRepository<T> {
  constructor(private readonly model: Model<T>) {}

  async create(data: any): Promise<any> {
    const createdEntity = new this.model(data);
    return await createdEntity.save();
  }

  async findById(id: string, option?: QueryOptions): Promise<any> {
    return this.model.findById(id, option);
  }

  async findOne(
    filter: any,
    field?: any | null,
    option?: QueryOptions<T>,
    populate?: any | null,
  ): Promise<Document> {
    return await this.model.findOne(filter, field, option).populate(populate);
  }

  async getByCondition(
    filter: FilterQuery<T>,
    field?: any | null,
    option?: QueryOptions<T>,
    populate?: any | null,
  ): Promise<T[]> {
    return this.model.find(filter, field, option).populate(populate);
  }

  async findAll(): Promise<T[]> {
    return this.model.find();
  }

  async populate(result: T[], option: any) {
    return await this.model.populate(result, option);
  }

  async deleteOne(id: string) {
    return this.model.deleteOne({ _id: id } as FilterQuery<T>);
  }

  // async deleteMany(id: string[]) {
  //   return this.model.deleteMany({ _id: { $in: id } } as FilterQuery<T>);
  // }

  async deleteByCondition(filter: any) {
    return this.model.deleteMany(filter);
  }

  async findByConditionAndUpdate(filter: any, data: any) {
    return this.model.findOneAndUpdate(filter as FilterQuery<T>, data);
  }

  async updateMany(
    filter: any,
    data: any,
    option?: any | null,
    // callback?: any | null,
  ) {
    return this.model.updateMany(filter, data, option);
  }

  async findByIdAndUpdate(id: string, data: any) {
    return this.model.findByIdAndUpdate(id, data);
  }
}
