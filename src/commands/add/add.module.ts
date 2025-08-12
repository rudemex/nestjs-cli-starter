import { Module } from '@nestjs/common';

import { AddCommand } from './commands/add.command';
import { AddApiService, AddPkgService } from './services';
import { TelemetryService } from '../../telemetry/services/telemetry.service';

@Module({
  providers: [
    ...AddCommand.registerWithSubCommands(),
    AddApiService,
    AddPkgService,
    TelemetryService,
  ],
})
export class AddModule {}
