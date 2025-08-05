import { Module } from '@nestjs/common';

import { BasicCommand } from './commands/basic.command';
import { TelemetryService } from '../../telemetry/telemetry.service';

@Module({
  providers: [BasicCommand, TelemetryService],
})
export class BasicModule {}
