import { SubCommand, CommandRunner, Option } from 'nest-commander';
import { AddPkgService } from '../../services';
import chalk from 'chalk';

interface PkgOptions {
  name: string;
  dev?: boolean;
  yarn?: boolean;
}

/**
 * Subcommand: `add pkg`
 */
@SubCommand({
  name: 'pkg',
  description: 'Add a new package to your project',
})
export class AddPkgCommand extends CommandRunner {
  constructor(private readonly pkgService: AddPkgService) {
    super();
  }

  async run(
    _params: string[], // eslint-disable-line @typescript-eslint/no-unused-vars
    options: PkgOptions,
  ): Promise<void> {
    if (!options.name) {
      console.log(chalk.red('❌ Missing required option: --name'));
      return;
    }

    this.pkgService.install(options.name, options.dev ?? false, options.yarn ?? false);
  }

  @Option({
    flags: '-n, --name <name>',
    description: 'Package name to install',
    required: true,
  })
  parseName(val: string): string {
    return val;
  }

  @Option({
    flags: '-D, --dev',
    description: 'Install as a devDependency',
    defaultValue: false,
  })
  parseDev(val: string): boolean {
    return val === 'true' || val === '1';
  }

  @Option({
    flags: '--yarn',
    description: 'Use Yarn instead of NPM',
    defaultValue: false,
  })
  parseYarn(val: string): boolean {
    return val === 'true' || val === '1';
  }
}
