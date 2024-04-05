import { NotFoundException } from '@nestjs/common';

export class DataNotFoundException extends NotFoundException {
  constructor(model: string, field: string, fieldValue: string) {
    super(`${model} not found with ${field}: ${fieldValue}`);
  }
}
