import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Question, QuestionSet } from 'nest-commander';
import chalk from 'chalk';

import { config } from '../../../config';

/**
 * Question set used by the `setup` command.
 *
 * This class defines multiple interactive prompts covering common configuration
 * needs: project name, port, target environment, selected features, admin password,
 * database engine, desired replicas, confirmation, and free-form notes.
 *
 * All messages, defaults, and validations are provided to guide the user and keep
 * inputs consistent. Answers are returned to the `SetupCommand` via `InquirerService`.
 */
@QuestionSet({ name: 'setup' })
@Injectable()
export class SetupQuestion {
  constructor(@Inject(config.KEY) private readonly cliConfig: ConfigType<typeof config>) {}

  /**
   * Project name prompt.
   *
   * - Input text, trimmed by the parser.
   * - Must be non-empty.
   */
  @Question({
    type: 'input',
    name: 'projectName',
    message: chalk.cyan('What is your project name?'),
    default: 'my-project',
    validate: (val: string) => (val?.trim()?.length ? true : 'Project name cannot be empty'),
    suffix: '',
  })
  parseProjectName(val: string): string {
    return val.trim();
  }

  /**
   * HTTP port prompt.
   *
   * - Numeric input.
   * - Valid range: 0..65535.
   */
  @Question({
    type: 'number',
    name: 'port',
    message: 'Which port do you want to use?',
    default: 3000,
    validate: (val: number) =>
      Number.isInteger(val) && val >= 0 && val <= 65535 ? true : 'Invalid port (0..65535)',
    suffix: '',
  })
  parsePort(val: number): number {
    return val;
  }

  /**
   * Confirmation prompt.
   *
   * - Boolean input (yes/no).
   * - Default: true (proceed).
   */
  @Question({
    type: 'confirm',
    name: 'confirm',
    message: 'Do you want to continue?',
    default: true,
    suffix: '',
  })
  parseConfirm(val: boolean): boolean {
    return val;
  }

  /**
   * Target environment selection.
   *
   * - Single-choice list, values provided from configuration (`config.envs`).
   * - Default: "local".
   * - No looping through the list.
   */
  @Question({
    type: 'list',
    name: 'env',
    message: 'Which environment do you want to configure?',
    choices(this: SetupQuestion) {
      return this.cliConfig.envs;
    },
    default: 'local',
    loop: false,
    pageSize: 3,
    suffix: '',
  })
  parseEnv(val: string): string {
    return val;
  }

  /**
   * Feature selection.
   *
   * - Multi-select checkbox.
   * - At least one feature must be selected.
   */
  @Question({
    type: 'checkbox',
    name: 'features',
    message: 'Which features do you want to enable?',
    choices: ['Auth', 'SNS', 'SQS', 'S3', 'CloudFront', 'Logger'],
    default: ['Logger'],
    validate: (val: string[]) =>
      Array.isArray(val) && val.length > 0 ? true : 'Select at least one feature',
    loop: false,
    pageSize: 10,
    suffix: '',
  })
  parseFeatures(val: string[]): string[] {
    return val;
  }

  /**
   * Admin password prompt.
   *
   * - Hidden input (masked).
   * - Minimum length: 6 characters.
   */
  @Question({
    type: 'password',
    name: 'adminPassword',
    message: 'Enter the admin password:',
    mask: '*',
    validate: (val: string) => (val?.length >= 6 ? true : 'Password must be at least 6 characters'),
    suffix: '',
  })
  parsePassword(val: string): string {
    return val;
  }

  /**
   * Database engine selection (expandable with hotkeys).
   *
   * - Expand type provides single-key shortcuts.
   * - Default key: 'm' (MongoDB).
   */
  @Question({
    type: 'expand',
    name: 'database',
    message: 'Which database do you want to use?',
    choices: [
      { key: 'm', name: 'MongoDB', value: 'mongo' },
      { key: 'p', name: 'PostgreSQL', value: 'postgres' },
      { key: 's', name: 'SQLite', value: 'sqlite' },
    ],
    default: 'm',
    suffix: '',
  })
  parseDatabase(val: string): string {
    return val;
  }

  /**
   * Number of replicas/instances to launch.
   *
   * - Numeric input.
   * - Must be > 0.
   */
  @Question({
    type: 'number',
    name: 'replicas',
    message: 'How many instances do you want to launch?',
    default: 1,
    validate: (input: number) =>
      Number.isFinite(input) && input > 0 ? true : 'It must be a number greater than 0',
    suffix: '',
  })
  parseReplicas(val: number): number {
    return val;
  }

  /**
   * Optional notes captured via the system editor.
   *
   * - Opens editor as defined by environment (e.g., $EDITOR).
   * - Returns the raw text as-is.
   */
  @Question({
    type: 'editor',
    name: 'notes',
    message: 'Optional notes (an editor will open)',
    postfix: '',
  })
  parseNotes(val: string): string {
    return val;
  }
}
