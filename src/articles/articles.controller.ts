import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  HttpException,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Pagination } from 'src/common/decorator/pagination.decorator';
import { GetCurrentUserId } from 'src/common/decorator/get-current-user-id';
import { PaginationRequest } from 'src/types';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileUploadDto } from 'src/upload-data/dto/file-upload.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { storageConfig } from 'src/config/store-config';
import { readFile, utils } from 'xlsx';
import { ProducerService } from 'src/queues/producer.service';
import { IMPORT_ARTICLES_QUEUE } from 'src/common/constants/blog.constant';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly producerService: ProducerService,
  ) {}

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

  @Post('import')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload excel file',
    type: FileUploadDto,
  })
  @UseInterceptors(
    FileInterceptor('excel', { storage: storageConfig('excel') }),
  )
  async uploadExcel(@UploadedFile() file: Express.Multer.File) {
    try {
      const wb = readFile(file.path);
      const data = utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      this.producerService.addToQueue(IMPORT_ARTICLES_QUEUE, data);
      return { message: 'Upload file successfully', statusCode: 200 };
    } catch (error) {
      throw new HttpException(
        'Failed to process uploaded file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
