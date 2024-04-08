import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Pagination = createParamDecorator(
  (_: undefined, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();

    const paginationParams = {
      limit: 10,
      page: 1,
      search: '',
      sort: '',
    };

    paginationParams.page = req.query.page
      ? parseInt(req.query.page.toString())
      : 1;

    paginationParams.limit = req.query.limit
      ? parseInt(req.query.limit.toString())
      : 10;

    paginationParams.search = req.query.search ? req.query.search : '';

    paginationParams.sort = req.query.sort ? req.query.sort : 'desc';

    return paginationParams;
  },
);
