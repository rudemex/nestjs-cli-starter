import { SubCommand, CommandRunner, Option, Help } from 'nest-commander';
import chalk from 'chalk';

import { AddPkgService } from '../../services';

/**
 * Subcomando que permite instalar paquetes NPM o Yarn dentro del proyecto actual.
 *
 * Sintaxis: `my-cli add pkg <package> [version] [options]`
 *
 * - Utiliza NPM por defecto.
 * - Soporta instalación como `devDependency`.
 * - Admite Yarn si se especifica con `--yarn`.
 */
@SubCommand({
  name: 'pkg',
  description: 'Add a new package to your project',
  arguments: '<pkgName> [version]',
  aliases: ['package', 'install'],
  argsDescription: {
    pkgName: 'Package name to install',
    version: 'Optional package version (e.g., 1.2.3)',
  },
  options: {
    isDefault: false,
    hidden: false,
  },
})
export class AddPkgCommand extends CommandRunner {
  constructor(private readonly pkgService: AddPkgService) {
    super();
  }

  /**
   * Ejecuta el comando `add pkg`.
   *
   * @param _params - Argumentos posicionales: [0] nombre del paquete, [1] versión opcional.
   * @param _options - Opciones como `--dev` o `--yarn`.
   */
  async run(_params: string[], _options: Record<string, any>): Promise<void> {
    if (!_params[0]?.trim()) {
      console.log(chalk.red('❌ Debes especificar el nombre del paquete.'));
      return;
    }

    await this.pkgService.install(_params, _options);
  }

  /**
   * Opción para instalar el paquete como devDependency.
   */
  @Option({
    flags: '-D, --dev',
    description: 'Install as a devDependency',
    defaultValue: false,
    required: false,
    name: 'asDev',
  })
  parseDev(val: string): boolean {
    return val === 'true' || val === '1' || val === undefined;
  }

  /**
   * Opción para usar Yarn en lugar de NPM.
   */
  @Option({
    flags: '--yarn',
    description: 'Use Yarn instead of NPM',
    defaultValue: false,
    required: false,
    name: 'pkgManager',
  })
  parseYarn(val: string): boolean {
    return val === 'true' || val === '1' || val === undefined;
  }

  /**
   * Ayuda adicional mostrada al final del comando.
   */
  @Help('afterAll')
  showExamples(): string {
    return `
📦 Ejemplos:

  $ cli add pkg axios
  👉 Instala 'axios' como dependencia normal con NPM

  $ cli add pkg eslint 8.50.0 --dev
  👉 Instala versión específica como devDependency

  $ cli add pkg chalk --yarn
  👉 Instala 'chalk' usando Yarn
`;
  }
}
