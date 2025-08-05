import { Command, CommandRunner } from 'nest-commander';
import chalk from 'chalk';
import { AddPkgCommand, AddApiCommand } from './subcommands';

/**
 * Root command: `add`
 */
@Command({
  name: 'add',
  description: 'Add new components to the project',
  subCommands: [AddPkgCommand, AddApiCommand],
})
export class AddCommand extends CommandRunner {
  async run(
    _inputs: string[], // eslint-disable-line @typescript-eslint/no-unused-vars
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
