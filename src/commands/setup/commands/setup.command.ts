import { Command, CommandRunner, InquirerService, Option } from 'nest-commander';
import ora, { Ora } from 'ora';
import chalk from 'chalk';

import { TelemetryService } from '../../../telemetry/telemetry.service';

@Command({
  name: 'setup',
  description: 'Configura el entorno del proyecto',
})
export class SetupCommand extends CommandRunner {
  constructor(
    private readonly telemetry: TelemetryService,
    private readonly inquirer: InquirerService,
  ) {
    super();
  }

  async run(_passedParams: string[], _options?: Record<string, any>): Promise<void> {
    const answers = await this.inquirer.ask<{
      projectName: string;
      env: string;
      notes: string;
      confirm: boolean;
    }>('setup', undefined);

    if (!answers.confirm) {
      console.log(chalk.red('❌ Configuración cancelada por el usuario.'));
      return;
    }

    const spinner: Ora = ora(
      chalk.blue(`🔧 Configurando entorno ${chalk.bold(answers.env)}...`),
    ).start();

    try {
      // Simulamos una tarea
      await new Promise((res) => setTimeout(res, _options?.timeout || 2000));

      spinner.succeed(
        chalk.green(
          `✅ Proyecto "${chalk.bold(answers.projectName)}" configurado en entorno ${answers.env}.`,
        ),
      );

      if (answers.notes?.trim()) {
        console.log(chalk.cyan('\n📝 Notas:'));
        console.log(chalk.white(answers.notes));
      }

      this.telemetry.capture('setup', { ...answers, _passedParams, _options });
    } catch {
      spinner.fail(chalk.red('❌ Error al configurar el entorno.'));
      return;
    }
  }

  @Option({
    flags: '-f, --force',
    description: 'Fuerza la configuración sin confirmar',
  })
  parseForce(): boolean {
    return true;
  }

  @Option({
    flags: '-t, --timeout [timeout]',
    description: 'Tiempo de espera simulado en ms',
  })
  parseTimeout(val: string): number {
    return parseInt(val, 10) || 2000;
  }
}
