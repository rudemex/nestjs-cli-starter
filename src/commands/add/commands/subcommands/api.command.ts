import { SubCommand, CommandRunner, Option, Help } from 'nest-commander';
import chalk from 'chalk';

import { AddApiService } from '../../services';

/**
 * Subcommand that configures a new external API integration.
 *
 * Syntax: `my-cli add api --name <name> --url <baseUrl> --type <type>`
 *
 * - Allows setting the service name, base URL, and API type.
 * - Accepts API types case-insensitively (REST, SOAP, GraphQL).
 *
 * @example
 * $ cli add api --name my-api --url https://api.example.com --type REST
 * 👉 Configures a RESTful API integration named "my-api"
 *
 * @example
 * $ cli add api -n payment-api -u https://pay.example.com -t soap
 * 👉 Configures a SOAP API integration for payments (case-insensitive)
 */
@SubCommand({
  name: 'api',
  description: 'Configure a new external API integration',
  aliases: ['service', 'integration'],
  arguments: '',
  argsDescription: {},
  options: {
    isDefault: false,
    hidden: false,
  },
})
export class AddApiCommand extends CommandRunner {
  constructor(private readonly apiService: AddApiService) {
    super();
  }

  /**
   * Executes the `add api` subcommand.
   *
   * @param _params - Not used for this subcommand.
   * @param _options - CLI options like `--name`, `--url`, and `--type`.
   */
  async run(_params: string[], _options: Record<string, any>): Promise<void> {
    const name = String(_options.name ?? '').trim();
    const url = String(_options.url ?? '').trim();
    const typeRaw = String(_options.type ?? '').trim();

    if (!name) {
      console.log(chalk.red('❌ You must provide a service name using --name'));
      return;
    }

    if (!url) {
      console.log(chalk.red('❌ You must provide a base URL using --url'));
      return;
    }

    // Quick URL sanity check (without extra deps)
    try {
      // Throws if invalid
      // eslint-disable-next-line no-new
      new URL(url);
    } catch {
      console.log(chalk.red(`❌ Invalid URL provided: "${_options.url}"`));
      console.log(chalk.yellow('👉 Example: --url https://api.example.com'));
      return;
    }

    // Accept case-insensitive types
    const normalizedType = typeRaw.toUpperCase();
    const allowedTypes = ['REST', 'SOAP', 'GRAPHQL'];
    if (!allowedTypes.includes(normalizedType)) {
      console.log(chalk.red(`❌ Invalid API type: "${_options.type}"`));
      console.log(chalk.yellow(`👉 Allowed values are: ${allowedTypes.join(', ')}`));
      return;
    }

    // Pass through to service following the project standard
    await this.apiService.generate(_params, {
      ..._options,
      name,
      url,
      type: normalizedType,
    });
  }

  /**
   * Option to define the name of the API integration.
   *
   * @param val - API service name.
   * @returns The provided string.
   */
  @Option({
    flags: '-n, --name <name>',
    description: 'Name of the API service (e.g., "payment-api")',
    required: true,
  })
  parseName(val: string): string {
    return val;
  }

  /**
   * Option to define the base URL of the API.
   *
   * @param val - Base URL of the external service.
   * @returns The provided URL string.
   */
  @Option({
    flags: '-u, --url <url>',
    description: 'Base URL of the external API',
    required: true,
  })
  parseUrl(val: string): string {
    return val;
  }

  /**
   * Option to define the API type (e.g., REST, SOAP, GraphQL).
   * Case-insensitive; it is normalized later in `run()`.
   *
   * @param val - Type of API to integrate with.
   * @returns The original string (normalization happens in `run()`).
   */
  @Option({
    flags: '-t, --type <type>',
    description: 'Type of API (REST, SOAP, GraphQL)',
    required: true,
  })
  parseType(val: string): string {
    return val;
  }

  /**
   * Displays extra help and usage examples at the bottom of the help output.
   *
   * @returns A string containing example usages of the subcommand.
   */
  @Help('afterAll')
  showExamples(): string {
    return `
🌐 Examples:

  $ cli add api --name my-api --url https://api.example.com --type REST
  👉 Configures a REST API integration

  $ cli add api -n auth-api -u https://auth.service.com -t GraphQL
  👉 Configures a GraphQL-based authentication API

  $ cli add api -n legacy -u https://legacy.vendor/wsdl -t soap
  👉 Configures a SOAP integration (case-insensitive)
`;
  }
}
