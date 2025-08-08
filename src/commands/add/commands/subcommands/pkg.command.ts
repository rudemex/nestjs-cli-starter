import { SubCommand, CommandRunner, Option, Help } from 'nest-commander';
import chalk from 'chalk';

import { AddPkgService } from '../../services';

/**
 * Subcommand that installs an NPM or Yarn package into the current project.
 *
 * Syntax: `my-cli add pkg <package> [version] [options]`
 *
 * - Uses NPM by default.
 * - Supports installation as a devDependency.
 * - Allows using Yarn instead of NPM with `--yarn`.
 *
 * @example
 * $ cli add pkg axios
 * 👉 Installs 'axios' as a regular dependency using NPM
 *
 * @example
 * $ cli add pkg eslint 8.50.0 --dev
 * 👉 Installs a specific version as a development dependency
 *
 * @example
 * $ cli add pkg chalk --yarn
 * 👉 Installs 'chalk' using Yarn instead of NPM
 */
@SubCommand({
  name: 'pkg',
  description: 'Add a new package to your project',
  arguments: '<pkgName> [version]',
  aliases: ['package', 'install'],
  argsDescription: {
    pkgName: 'Name of the package to install',
    version: 'Optional package version (e.g., 1.2.3)',
  },
  options: {
    isDefault: false,
    hidden: false,
  },
})
export class AddPkgCommand extends CommandRunner {
  constructor(private readonly pkgService: AddPkgService) {
    super();
  }

  /**
   * Executes the `add pkg` subcommand.
   *
   * @param _params - Positional arguments: [0] is the package name, [1] is the optional version.
   * @param _options - CLI options such as `--dev` or `--yarn`.
   */
  async run(_params: string[], _options: Record<string, any>): Promise<void> {
    if (!_params[0]?.trim()) {
      console.log(chalk.red('❌ You must specify the package name.'));
      return;
    }

    const normalizedOptions = {
      asDev: _options.asDev ?? false,
      pkgManager: _options.pkgManager ?? false,
    };

    await this.pkgService.install(_params, normalizedOptions);
  }

  /**
   * Option to install the package as a development dependency.
   *
   * Accepts the following values as truthy: `--dev`, `--dev=true`, `--dev=1`.
   * If the option is passed without a value, it defaults to `true`.
   *
   * @param val - Value passed to the `--dev` flag.
   * @returns `true` if the package should be installed as a devDependency.
   */
  @Option({
    flags: '-D, --dev [value]',
    description: 'Install as a devDependency',
    required: false,
    name: 'asDev',
  })
  parseDev(val: string | boolean | undefined): boolean {
    if (val === undefined) return true;
    return val === true || val === 'true' || val === '1';
  }

  /**
   * Option to use Yarn instead of NPM.
   *
   * Accepts the following values as truthy: `--yarn`, `--yarn=true`, `--yarn=1`.
   * If the option is passed without a value, it defaults to `true`.
   *
   * @param val - Value passed to the `--yarn` flag.
   * @returns `true` if Yarn should be used as the package manager.
   */
  @Option({
    flags: '--yarn [value]',
    name: 'pkgManager',
    description: 'Use Yarn instead of NPM',
    required: false,
  })
  parseYarn(val: string | boolean | undefined): boolean {
    if (val === undefined) return true;
    return val === true || val === 'true' || val === '1';
  }

  /**
   * Displays extra help and usage examples at the bottom of the help output.
   *
   * @returns A string containing example usages of the subcommand.
   */
  @Help('afterAll')
  showExamples(): string {
    return `
📦 Examples:

  $ cli add pkg axios
  👉 Installs 'axios' as a regular dependency using NPM

  $ cli add pkg eslint 8.50.0 --dev
  👉 Installs a specific version as a devDependency

  $ cli add pkg chalk --yarn
  👉 Installs 'chalk' using Yarn
`;
  }
}
