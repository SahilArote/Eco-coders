import { Module } from '@nestjs/common';
import { ProcurementService } from './procurement.service';
import { ProcurementController } from './procurement.controller';
import { ProcurementStateMachineService } from './procurement-state-machine.service';

@Module({
  controllers: [ProcurementController],
  providers: [ProcurementService, ProcurementStateMachineService],
  exports: [ProcurementService, ProcurementStateMachineService],
})
export class ProcurementModule {}
