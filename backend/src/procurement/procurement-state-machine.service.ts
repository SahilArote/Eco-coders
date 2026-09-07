import { Injectable, ConflictException } from '@nestjs/common';
import { ProcurementStatus } from '@prisma/client';
import { ErrorCode } from '../common/constants/error-codes';

@Injectable()
export class ProcurementStateMachineService {
  private readonly transitions: Record<ProcurementStatus, ProcurementStatus[]> = {
    [ProcurementStatus.BOOKED]: [ProcurementStatus.ARRIVED, ProcurementStatus.CANCELLED],
    [ProcurementStatus.ARRIVED]: [ProcurementStatus.WAITING, ProcurementStatus.PROCESSING],
    [ProcurementStatus.WAITING]: [ProcurementStatus.PROCESSING],
    [ProcurementStatus.PROCESSING]: [ProcurementStatus.QUALITY_CHECK],
    [ProcurementStatus.QUALITY_CHECK]: [ProcurementStatus.WEIGHMENT, ProcurementStatus.REJECTED],
    [ProcurementStatus.WEIGHMENT]: [ProcurementStatus.ACCEPTED],
    [ProcurementStatus.ACCEPTED]: [ProcurementStatus.COMPLETED],
    [ProcurementStatus.COMPLETED]: [ProcurementStatus.PAYMENT_PROCESSING],
    [ProcurementStatus.PAYMENT_PROCESSING]: [ProcurementStatus.PAYMENT_COMPLETED],
    [ProcurementStatus.REJECTED]: [], // Terminal
    [ProcurementStatus.PAYMENT_COMPLETED]: [], // Terminal
    [ProcurementStatus.CANCELLED]: [], // Terminal
  };

  validateTransition(current: ProcurementStatus, target: ProcurementStatus): void {
    const allowed = this.transitions[current] || [];
    if (!allowed.includes(target)) {
      throw new ConflictException({
        code: ErrorCode.PROCUREMENT_INVALID_TRANSITION,
        message: `Illegal state transition from '${current}' to '${target}'. Allowed transitions: [${allowed.join(', ')}]`,
      });
    }
  }
}
