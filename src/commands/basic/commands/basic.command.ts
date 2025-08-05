import { CommandRunner, Command, Option } from 'nest-commander';

@Command({
  name: 'basic',
  arguments: '[task]',
  description: 'A parameter parse',
})
export class BasicCommand extends CommandRunner {
  constructor() {
    super();
  }

  async run(passedParams: string[], options?: Record<string, any>): Promise<void> {
    console.log('CLI Params', passedParams);
    console.log('CLI Options', options);
    return Promise.resolve(undefined);
  }
  @Option({
    flags: '-n, --number [number]',
    description: 'A basic number parser',
  })
  parseNumber(val: string): number {
    return Number(val);
  }
}
