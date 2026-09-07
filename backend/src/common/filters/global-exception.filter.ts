import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from '../dto/api-response.dto';
import { ErrorCode } from '../constants/error-codes';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: string = ErrorCode.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred. Please try again later.';
    let details: Record<string, any> = {};

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, any>;
        message = resObj.message || exception.message;
        code = resObj.code || (status === 404 ? ErrorCode.RESOURCE_NOT_FOUND : code);
        details = resObj.details || (Array.isArray(resObj.message) ? { validationErrors: resObj.message } : {});
        if (Array.isArray(resObj.message)) {
          code = ErrorCode.VALIDATION_FAILED;
          message = 'Validation failed';
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled Exception: ${exception.message}`, exception.stack);
      message = exception.message;
    }

    const requestId = (request.headers['x-request-id'] as string) || `req-${Date.now()}`;

    const errorPayload: ApiErrorResponse = {
      success: false,
      error: {
        code,
        message,
        details: Object.keys(details).length > 0 ? details : undefined,
      },
      timestamp: new Date().toISOString(),
      requestId,
    };

    response.status(status).json(errorPayload);
  }
}
