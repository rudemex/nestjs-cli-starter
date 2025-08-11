import { Module } from '@nestjs/common';

import { InfoCommand } from './commands/info.command';
import { TelemetryService } from '../../telemetry/telemetry.service';

@Module({
  providers: [InfoCommand, TelemetryService],
})
export class InfoModule {}
