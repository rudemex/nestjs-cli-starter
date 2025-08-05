import { Module } from '@nestjs/common';

import { SetupCommand } from './commands/setup.command';
import { SetupQuestions } from './questions/setup.questions';
import { TelemetryService } from '../../telemetry/telemetry.service';

@Module({
  providers: [SetupCommand, SetupQuestions, TelemetryService],
})
export class SetupModule {}
