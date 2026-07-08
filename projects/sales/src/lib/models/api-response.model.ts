export interface ApiResponse<T = void> {
  success: boolean;
  message: string | null;
  data?: T;
}

export interface ApiErrorResponse {
  message: string | null;
  errors: string[] | null;
}
