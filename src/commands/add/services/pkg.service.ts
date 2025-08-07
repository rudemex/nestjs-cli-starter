import { Injectable } from '@nestjs/common';
import chalk from 'chalk';
import ora, { Ora } from 'ora';

@Injectable()
export class AddPkgService {
  /**
   * Ejecuta la instalación del paquete (simulada con un spinner).
   *
   * @param _params - [pkgName, version?] Argumentos. El primero debe ser el nombre del paquete y el segundo la versión (opcional).
   * @param _options - Opciones del comando (`asDev`, `pkgManager`, etc.).
   */
  async install(_params: string[], _options: Record<string, any>): Promise<void> {
    const [pkgName, version] = _params;
    const dev = _options.asDev ?? false;
    const yarn = _options.pkgManager ?? false;
    const fullName = version ? `${pkgName}@${version}` : pkgName;

    const tool = yarn ? 'yarn add' : `npm install${dev ? ' --save-dev' : ''}`;
    const command = `${tool} ${fullName}`;

    const spinner: Ora = ora(
      chalk.blue(`Instalando ${chalk.bold(fullName)} usando ${tool}...`),
    ).start();

    try {
      // Simula un proceso de instalación de 1.5 segundos
      await new Promise((resolve) => setTimeout(resolve, 3000));

      spinner.succeed(chalk.green(`✅  Paquete instalado: ${chalk.bold(fullName)}`));
      console.log(chalk.gray(`> ${command}`));
    } catch {
      spinner.fail(chalk.red(`❌ Error al instalar ${chalk.bold(fullName)}`));
    }
  }
}
