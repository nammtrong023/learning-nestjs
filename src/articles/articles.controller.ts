import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Pagination } from 'src/common/decorator/pagination';
import { GetCurrentUserId } from 'src/common/decorator/get-current-user-id';
import { PaginationRequest } from 'src/types';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  create(
    @GetCurrentUserId() userId: string,
    @Body() createArticleDto: CreateArticleDto,
  ) {
    return this.articlesService.create(userId, createArticleDto);
  }

  @Get()
  findAll(@Pagination() pagination: PaginationRequest) {
    return this.articlesService.findAll(pagination);
  }

  @Get('categories/:categoryId')
  findByCategory(
    @Param('categoryId') categoryId: string,
    @Pagination() pagination: PaginationRequest,
  ) {
    return this.articlesService.findByCategoryId(categoryId, pagination);
  }

  @Get('users/:userId')
  findByUserId(
    @Param('userId') userId: string,
    @Pagination() pagination: PaginationRequest,
  ) {
    return this.articlesService.findByUserId(userId, pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articlesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @GetCurrentUserId() userId: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return this.articlesService.update(id, userId, updateArticleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetCurrentUserId() userId: string) {
    return this.articlesService.remove(id, userId);
  }
}
