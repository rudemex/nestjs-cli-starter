import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { config } from './config';

import { AddModule } from './commands/add/add.module';
import { BasicModule } from './commands/basic/basic.module';
import { SetupModule } from './commands/setup/setup.module';
import { InfoModule } from './commands/info/info.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
      ignoreEnvFile: true,
    }),
    AddModule,
    BasicModule,
    InfoModule,
    SetupModule,
  ],
})
export class CliModule {}
