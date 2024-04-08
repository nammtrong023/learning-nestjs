export class ObjectResponse<T> {
  data?: T;
  message: string;
  statusCode: number;
}
