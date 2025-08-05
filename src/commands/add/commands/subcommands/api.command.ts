import { SubCommand, CommandRunner, Option } from 'nest-commander';
import { AddApiService } from '../../services';
import chalk from 'chalk';

interface ApiOptions {
  name: string;
  crud?: boolean;
  withTests?: boolean;
}

/**
 * Subcommand: `add api`
 */
@SubCommand({
  name: 'api',
  description: 'Scaffold a new API resource (module, controller, service)',
})
export class AddApiCommand extends CommandRunner {
  constructor(private readonly apiService: AddApiService) {
    super();
  }

  async run(
    _params: string[], // eslint-disable-line @typescript-eslint/no-unused-vars
    options: ApiOptions,
  ): Promise<void> {
    if (!options.name) {
      console.log(chalk.red('❌ Missing required option: --name'));
      return;
    }

    this.apiService.generate(options.name, options.crud ?? true, options.withTests ?? false);
  }

  @Option({
    flags: '-n, --name <name>',
    description: 'Name of the API resource',
    required: true,
  })
  parseName(val: string): string {
    return val;
  }

  @Option({
    flags: '--crud',
    description: 'Include basic CRUD methods',
    defaultValue: true,
  })
  parseCrud(val: string): boolean {
    return val === 'true' || val === '1';
  }

  @Option({
    flags: '--with-tests',
    description: 'Include unit test files',
    defaultValue: false,
  })
  parseWithTests(val: string): boolean {
    return val === 'true' || val === '1';
  }
}
