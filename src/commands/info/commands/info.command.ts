import { Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Command, CommandRunner, Help } from 'nest-commander';
import chalk from 'chalk';
import Table from 'cli-table3';

import { config } from '../../../config';

/**
 * Root-level command that prints CLI environment and project metadata.
 *
 * This command reads values from the application configuration and displays
 * them in a formatted table, including CLI name, version, description,
 * default command, Node.js version, and host system information.
 *
 * @example
 * $ nestjs-cli-starter info
 * 👉 Prints a summary of the CLI environment and configuration
 */
@Command({
  name: 'info',
  description: 'Show basic information about this CLI',
  aliases: ['i', 'about'],
  arguments: '',
  argsDescription: {},
  options: {
    isDefault: false,
    hidden: false,
  },
})
export class InfoCommand extends CommandRunner {
  constructor(@Inject(config.KEY) private readonly appConfig: ConfigType<typeof config>) {
    super();
  }

  /**
   * Executes the `info` command.
   *
   * This implementation is side-effect free and only prints information
   * to STDOUT. It does not accept positional parameters or options.
   *
   * @param _params - Positional CLI arguments (unused).
   * @param _options - Parsed CLI options (unused).
   * @returns A promise that resolves after printing the information table.
   */
  async run(
    _params?: string[], // eslint-disable-line @typescript-eslint/no-unused-vars
    _options?: Record<string, any>, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<void> {
    const pkg = this.appConfig.project;

    const table = new Table({
      head: [chalk.cyan('Property'), chalk.cyan('Value')],
      colAligns: ['left', 'center'],
      style: { head: ['cyan'] },
    });

    table.push(
      ['CLI Name', pkg.name],
      ['Version', pkg.version],
      ['Description', pkg.description ?? 'N/A'],
      ['Default Command', pkg.command],
      ['Node.js', process.version],
      ['System', `${process.platform} (${process.arch})`],
    );

    console.log(chalk.yellow.bold('\n📊 CLI Environment Information:\n'));
    console.log(table.toString());
  }

  /**
   * Help text displayed before the command help output.
   *
   * @returns A short description of what the command does.
   */
  @Help('beforeAll')
  beforeAllHelp(): string {
    return 'ℹ️  This command provides general information about your CLI.\n';
  }

  /**
   * Help text displayed after the command help output.
   *
   * @returns A tip on how this command can be used.
   */
  @Help('afterAll')
  afterHelp(): string {
    return '\n💡 Tip: Use this command to quickly verify the CLI version and configuration.';
  }
}
