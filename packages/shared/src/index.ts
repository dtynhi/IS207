export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiSuccess<T> = {
  data: T;
};

export type ApiResponse<T> = ApiSuccess<T> | { error: ApiError };

export type PaginationQuery = {
  page?: number;
  limit?: number;
};
