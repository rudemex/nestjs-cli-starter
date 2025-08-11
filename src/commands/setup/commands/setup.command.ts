import { Command, CommandRunner, InquirerService, Option, Help } from 'nest-commander';
import ora, { Ora } from 'ora';
import chalk from 'chalk';

import { TelemetryService } from '../../../telemetry/telemetry.service';

/**
 * Root-level command that configures the project environment.
 *
 * This command optionally prompts the user (via `InquirerService`) for:
 * - `projectName` (string): Project identifier.
 * - `env` (string): Target environment (e.g., local, dev, prod).
 * - `notes` (string): Optional free-form notes.
 * - `confirm` (boolean): Whether to proceed with the configuration.
 *
 * Behavior:
 * - If `--force` is passed, confirmation is assumed `true` regardless of the prompt.
 * - A spinner simulates the configuration task for `--timeout` ms (default 2000ms).
 * - On success, it prints a summary; if the user provided notes, they are echoed.
 * - Telemetry is captured with the merged payload (answers, params, options).
 *
 * This command does not write files; it is intended for interactive setup flows.
 *
 * @example
 * $ cli setup
 * 👉 Interactive setup with prompts
 *
 * @example
 * $ cli setup --force --timeout 1000
 * 👉 Non-interactive (auto-confirm) with a 1s simulated task
 */
@Command({
  name: 'setup',
  description: 'Configure the project environment',
  aliases: ['s', 'configure'],
  arguments: '',
  argsDescription: {},
  options: {
    isDefault: false,
    hidden: false,
  },
})
export class SetupCommand extends CommandRunner {
  constructor(
    private readonly telemetry: TelemetryService,
    private readonly inquirer: InquirerService,
  ) {
    super();
  }

  /**
   * Executes the `setup` command.
   *
   * @param _params - Positional CLI params (unused).
   * @param _options - Parsed CLI options (e.g., `force`, `timeout`).
   * @returns A promise that resolves once the simulated setup is complete.
   */
  async run(_params: string[], _options?: Record<string, any>): Promise<void> {
    // Ask questions registered under the "setup" key (defined elsewhere).
    const answers = await this.inquirer.ask<{
      projectName: string;
      env: string;
      notes: string;
      confirm: boolean;
    }>('setup', undefined);

    const force = Boolean(_options?.force ?? false);
    const timeoutMs = Number.isFinite(Number(_options?.timeout)) ? Number(_options!.timeout) : 2000;

    // If --force, override confirmation
    const confirmed = force ? true : answers.confirm;

    if (!confirmed) {
      console.log(chalk.red('❌ Setup aborted by the user.'));
      return;
    }

    const spinner: Ora = ora(
      chalk.blue(`🔧 Setting up environment ${chalk.bold(answers.env)}...`),
    ).start();

    try {
      // Simulate work
      await new Promise((res) => setTimeout(res, timeoutMs));

      spinner.succeed(
        chalk.green(
          `✅ Project "${chalk.bold(answers.projectName)}" configured for environment ${answers.env}.`,
        ),
      );

      if (answers.notes?.trim()) {
        console.log(chalk.cyan('\n📝 Notes:'));
        console.log(chalk.white(answers.notes));
      }

      this.telemetry.capture('setup', {
        ...answers,
        force,
        timeout: timeoutMs,
        _params,
        _options,
      });
    } catch {
      spinner.fail(chalk.red('❌ Failed to configure the environment.'));
    }
  }

  /**
   * Force the setup to proceed without an explicit confirmation.
   *
   * Accepts the following as truthy:
   * - `--force`
   * - `--force=true`
   * - `--force=1`
   *
   * If provided without a value, it defaults to `true`.
   *
   * @param val - Optional value passed to the flag.
   * @returns `true` when setup should auto-confirm; otherwise `false`.
   */
  @Option({
    flags: '-f, --force [value]',
    description: 'Force configuration without confirmation',
    required: false,
    name: 'force',
  })
  parseForce(val: string | boolean | undefined): boolean {
    if (val === undefined) return true;
    return val === true || val === 'true' || val === '1';
  }

  /**
   * Configure the simulated timeout for the setup task.
   *
   * If the value is missing or invalid, it falls back to 2000ms.
   *
   * @param val - Milliseconds as a string (e.g., "1500").
   * @returns A number of milliseconds to wait.
   */
  @Option({
    flags: '-t, --timeout [timeout]',
    description: 'Simulated timeout in milliseconds (default: 2000)',
    required: false,
    name: 'timeout',
  })
  parseTimeout(val: string | undefined): number {
    const n = Number(val);
    return Number.isFinite(n) && n >= 0 ? n : 2000;
  }

  /**
   * Extra usage examples appended at the end of `--help`.
   *
   * @returns A string with additional examples and tips.
   */
  @Help('afterAll')
  showExamples(): string {
    return `
🧭 Examples:

  $ cli setup
  👉 Start interactive setup

  $ cli setup --force
  👉 Skip confirmation and proceed with defaults/answers

  $ cli setup --timeout 5000
  👉 Simulate a longer setup task
`;
  }
}
