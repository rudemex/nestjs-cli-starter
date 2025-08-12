import { Injectable } from '@nestjs/common';

@Injectable()
export class TelemetryService {
  private readonly events: any[] = [];

  capture(command: string, payload: Record<string, unknown>): void {
    const entry = {
      command,
      payload,
      timestamp: new Date().toISOString(),
    };

    this.events.push(entry);

    // Envío o log según tu plataforma
    console.log(`📡 Telemetría: ${command}`, JSON.stringify(payload, null, 2));
  }

  getEvents(): any[] {
    return this.events;
  }
}
