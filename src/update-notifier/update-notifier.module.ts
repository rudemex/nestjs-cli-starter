import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UpdateNotifierService } from './services/update-notifier.service';
import { ConfigStoreModule } from '../config-store/config-store.module';

@Module({
  imports: [ConfigModule, ConfigStoreModule],
  providers: [UpdateNotifierService],
})
export class UpdateNotifierModule {}
