import { Module } from '@nestjs/common';

import { SetupCommand } from './commands/setup.command';
import { SetupQuestion } from './questions/setup.question';
import { TelemetryService } from '../../telemetry/telemetry.service';

@Module({
  providers: [SetupCommand, SetupQuestion, TelemetryService],
})
export class SetupModule {}
