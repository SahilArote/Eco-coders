import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { ErrorCode } from '../constants/error-codes';

@Injectable()
export class CenterScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException({
        code: ErrorCode.AUTH_FORBIDDEN,
        message: 'Authentication required for center-scoped operation.',
      });
    }

    // Admins have global access
    if (user.role === Role.ADMIN) {
      return true;
    }

    if (user.role === Role.CENTER_OPERATOR) {
      const targetCenterId =
        request.params.centerId ||
        request.body.centerId ||
        request.query.centerId;

      if (!user.centerId) {
        throw new ForbiddenException({
          code: ErrorCode.CENTER_ACCESS_DENIED,
          message: 'Operator has no procurement center assigned.',
        });
      }

      if (targetCenterId && targetCenterId !== user.centerId) {
        throw new ForbiddenException({
          code: ErrorCode.CENTER_ACCESS_DENIED,
          message: 'Operator is not authorized to access or mutate records for this procurement center.',
        });
      }

      return true;
    }

    return true;
  }
}
