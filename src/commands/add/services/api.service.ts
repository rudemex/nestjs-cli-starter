import { Injectable } from '@nestjs/common';
import chalk from 'chalk';
import ora, { Ora } from 'ora';
import Table from 'cli-table3';

/**
 * Service that displays a summary of an external API integration setup.
 *
 * This service is invoked by the `add api` subcommand and prints a formatted
 * table with the provided options. It is designed to be side-effect free.
 */
@Injectable()
export class AddApiService {
  /**
   * Renders a summary table for the API integration using the provided options.
   *
   * @param _params - Positional arguments passed to the command (unused).
   * @param _options - Options object containing:
   *  - `name`: string — service name/identifier.
   *  - `url`: string — base URL of the external API.
   *  - `type`: string — API type (e.g., REST, SOAP, GRAPHQL).
   */
  async generate(_params: string[], _options: Record<string, any>): Promise<void> {
    // Defensive extraction & normalization (command already validates, but let's be safe)
    const name = String(_options?.name ?? '').trim();
    const url = String(_options?.url ?? '').trim();
    const type = String(_options?.type ?? '')
      .trim()
      .toUpperCase();

    const spinner: Ora = ora(
      `Configuring integration for "${chalk.cyan(name || 'unknown')}"...`,
    ).start();

    try {
      // Optional small delay to emulate work
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
    } catch (err) {
      spinner.fail(chalk.red('❌ Failed to configure the API integration'));
      console.error(chalk.red((err as Error)?.message ?? err));
    }
  }
}
