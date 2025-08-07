import { Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Command, CommandRunner, Help } from 'nest-commander';
import chalk from 'chalk';
import Table from 'cli-table3';

import { config } from '../../../config';

@Command({
  name: 'info',
  description: 'Muestra información básica del CLI',
})
export class InfoCommand extends CommandRunner {
  constructor(@Inject(config.KEY) private readonly appConfig: ConfigType<typeof config>) {
    super();
  }
  async run(): Promise<void> {
    await Promise.resolve();
    const pkg = this.appConfig.project;

    const table = new Table({
      head: [chalk.cyan('Propiedad'), chalk.cyan('Valor')],
      colAligns: ['left', 'center'],
      style: { head: ['cyan'] },
    });

    table.push(
      ['Nombre del CLI', pkg.name],
      ['Versión', pkg.version],
      ['Descripción', pkg.description ?? 'N/A'],
      ['Comando', pkg.command],
      ['Node.js', process.version],
      ['Sistema', `${process.platform} (${process.arch})`],
    );

    console.log(chalk.yellow.bold('\n📊 Información del entorno CLI:\n'));
    console.log(table.toString());
  }

  @Help('beforeAll')
  beforeAllHelp(): string {
    return 'ℹ️  Este comando proporciona información general sobre tu CLI.\n';
  }

  @Help('after')
  afterHelp(): string {
    return '\n💡 Tip: Podés usar este comando para verificar la versión y configuración.';
  }
}
