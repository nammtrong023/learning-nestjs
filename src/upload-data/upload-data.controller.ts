import {
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Queue } from 'bull';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { storageConfig } from 'src/config/store-config';
import { FileUploadDto } from './dto/file-upload.dto';
import { readFile, utils } from 'xlsx';
import { InjectImportArticlesQueue } from 'src/common/decorator/inject-queue.decorator';
import { IMPORT_ARTICLES } from 'src/common/constants/blog.constant';

@ApiTags('Upload')
@Controller('upload')
export class UploadDataController {
  constructor(@InjectImportArticlesQueue() private queue: Queue) {}

  @Post()
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
      await this.queue.add(IMPORT_ARTICLES, data);

      return { message: 'Import data successfully', statusCode: 200 };
    } catch (error) {
      throw new HttpException(
        'Failed to process uploaded file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
