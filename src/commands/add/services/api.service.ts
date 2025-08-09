import { Injectable } from '@nestjs/common';
import chalk from 'chalk';
import ora, { Ora } from 'ora';
import Table from 'cli-table3';

/**
 * Service responsible for simulating the setup of an external API integration.
 *
 * This service is executed by the `add api` subcommand and:
 * - Displays a spinner during the simulated configuration process.
 * - Validates that required details (name, base URL, type) are provided.
 * - Prints a formatted table summarizing the API integration settings.
 *
 * **Note:** This service does not generate any files or make network requests;
 * it is purely for CLI feedback purposes.
 */
@Injectable()
export class AddApiService {
  /**
   * Simulates the API integration setup process and displays the integration summary.
   *
   * @param _params - Positional arguments passed from the CLI.
   *   - Not used in this implementation (parameters come from options).
   *
   * @param _options - Options object parsed from the CLI.
   *   - `name` (`string`) – API service name or identifier.
   *   - `url` (`string`) – Base URL of the external API.
   *   - `type` (`string`) – API type (REST, SOAP, GRAPHQL, etc.).
   *
   * @returns A `Promise<void>` that resolves after displaying the integration summary.
   *
   * @example
   * ```ts
   * await addApiService.generate([], {
   *   name: 'payment-service',
   *   url: 'https://api.example.com/payments',
   *   type: 'REST'
   * });
   * // → Spinner starts, then shows a summary table
   * ```
   *
   * @throws {Error} Only if an unexpected runtime error occurs during processing.
   */
  async generate(_params: string[], _options: Record<string, any>): Promise<void> {
    const name = String(_options?.name ?? '').trim();
    const url = String(_options?.url ?? '').trim();
    const type = String(_options?.type ?? '')
      .trim()
      .toUpperCase();

    const spinner: Ora = ora(
      `Configuring integration for "${chalk.cyan(name || 'unknown')}"...`,
    ).start();

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (!name || !url || !type) {
        spinner.fail(chalk.red('❌ Missing integration details (name, url, or type).'));
        return;
      }

      spinner.succeed('✔ API integration configured successfully');

      const table = new Table({
        head: [chalk.bold('Property'), chalk.bold('Value')],
        style: { head: ['cyan'] },
        wordWrap: true,
      });

      table.push(
        ['Service name', chalk.cyan(name)],
        ['API type', chalk.yellow(type)],
        ['Base URL', chalk.gray(url)],
      );

      console.log(table.toString());
      console.log(chalk.green('\n✅  Your API integration setup is ready.\n'));
    } catch {
      spinner.fail(chalk.red('❌ Failed to configure the API integration'));
    }
  }
}
