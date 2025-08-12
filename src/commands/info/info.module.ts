import { Module } from '@nestjs/common';

import { InfoCommand } from './commands/info.command';
import { TelemetryService } from '../../telemetry/services/telemetry.service';

@Module({
  providers: [InfoCommand, TelemetryService],
})
export class InfoModule {}
