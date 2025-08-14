import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import Configstore from 'configstore';

import { ConfigStoreService } from './services/config-store.service';
import { CONFIG_STORE } from './constants/config-store.constant';
import { config } from '../config';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      /**
       * Underlying `Configstore` instance.
       * ID = "<project.name>/config".
       * If `CLI_STORE_CONFIG_PATH` is set, it will be used as the file location (tests/CI).
       */
      provide: CONFIG_STORE,
      inject: [config.KEY],
      useFactory: (appConfig: ConfigType<typeof config>) =>
        new Configstore(`${appConfig.project?.name}/config`, {}),
    },
    {
      /**
       * Service factory:
       * - Inject the app config + store.
       * - Construct the service and run `init()` (first run: dynamic seed; subsequent: refresh).
       */
      provide: ConfigStoreService,
      inject: [config.KEY, CONFIG_STORE],
      useFactory: (appConfig: ConfigType<typeof config>, store: Configstore) => {
        const svc = new ConfigStoreService(appConfig, store);
        svc.init(); // ensure the store is fully initialized before use
        return svc;
      },
    },
  ],
  exports: [ConfigStoreService],
})
export class ConfigStoreModule {}
