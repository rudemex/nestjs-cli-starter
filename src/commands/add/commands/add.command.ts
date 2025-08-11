import { Command, CommandRunner } from 'nest-commander';
import chalk from 'chalk';
import { AddPkgCommand, AddApiCommand } from './subcommands';

/**
 * Root command: `add`
 *
 * This command acts as a container for the `add` subcommands.
 * It does not perform any action by itself, but delegates execution to its subcommands.
 *
 * Available subcommands:
 * - `add pkg` → Installs or simulates installation of a package.
 * - `add api` → Configures an external API integration.
 *
 * If executed without a subcommand, it will print a hint message
 * showing how to use the available subcommands.
 *
 * @example
 * $ nestjs-cli-starter add pkg axios
 * 👉 Installs `axios` into the current project.
 *
 * @example
 * $ nestjs-cli-starter add api -n auth-api -u https://auth.example.com -t REST
 * 👉 Configures a REST API integration named "auth-api".
 */
@Command({
  name: 'add',
  description: 'Add new components to the project',
  aliases: ['a'],
  arguments: '',
  argsDescription: {},
  options: {
    isDefault: false,
    hidden: false,
  },
  subCommands: [AddPkgCommand, AddApiCommand],
})
export class AddCommand extends CommandRunner {
  /**
   * Executes the root `add` command when no subcommand is provided.
   *
   * @param _params - CLI parameters passed after the command name (not used here).
   * @param _options - CLI options passed to the command (not used here).
   */
  async run(
    _params: string[], // eslint-disable-line @typescript-eslint/no-unused-vars
    _options?: Record<string, any>, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<void> {
    console.log(
      chalk.yellowBright(
        '⚠️  Please specify a subcommand.\n' +
          'Try one of:\n' +
          '  nestjs-cli-starter add pkg --help\n' +
          '  nestjs-cli-starter add api --help',
      ),
    );
  }
}
