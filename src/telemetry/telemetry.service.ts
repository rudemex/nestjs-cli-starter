import { Inject, Injectable } from '@nestjs/common';
import { Analytics } from '@segment/analytics-node';
import { config } from '../config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class TelemetryService {
  private readonly segmentClient: Analytics;
  private readonly events: any[] = [];

  constructor(@Inject(config.KEY) private readonly appConfig: ConfigType<typeof config>) {
    this.segmentClient = new Analytics({ writeKey: this.appConfig.segment.key });
  }

  capture(command: string, payload: Record<string, unknown>): void {
    const entry = {
      command,
      payload,
      timestamp: new Date().toISOString(),
    };

    this.events.push(entry);

    this.segmentClient.track({
      userId: 'f4ca124298',
      event: `${command}`,
      properties: payload,
    });

    // Envío o log según tu plataforma
    console.log(`📡 Telemetría: ${command}`, JSON.stringify(payload, null, 2));
  }

  getEvents(): any[] {
    return this.events;
  }
}
