export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export type JwtPayload = {
  id: string;
  email: string;
};

export type UserType = {
  email: string;
  name: string;
};

export type JwtPayloadWithRtToken = JwtPayload & { refreshToken: string };
export type JwtPayloadWithAtToken = JwtPayload & { accessToken: string };
export type JwtPayloadWithTokens = JwtPayload & Tokens;

export type PaginationRequest = {
  limit?: number;
  page?: number;
  search?: string;
  sort?: 'asc' | 'desc';
};

export type PaginationResponse<T> = {
  data: T[];
  meta: {
    limit?: number;
    page?: number;
    totalPage: number;
  };
};

export interface QueueConfig {
  name: string;
  options: any;
}
