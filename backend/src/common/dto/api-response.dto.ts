export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
  requestId?: string;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetail;
  timestamp: string;
  requestId?: string;
}
