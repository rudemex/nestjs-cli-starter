import { Injectable } from '@nestjs/common';
import chalk from 'chalk';
import ora, { Ora } from 'ora';

/**
 * Service responsible for simulating the installation of a package
 * in the current project.
 *
 * This service **does not** execute the actual installation.
 * Instead, it uses a loading spinner (`ora`) to mimic the process,
 * prints a success message to the console, and displays the equivalent
 * installation command for reference.
 *
 * Useful for testing CLI command flows without modifying the system.
 */
@Injectable()
export class AddPkgService {
  /**
   * Simulates the installation of a package using a loading spinner.
   *
   * @param _params - Positional arguments passed from the CLI.
   *   - `[0]` **pkgName** – Name of the package to install (required).
   *   - `[1]` **version** – Optional package version (e.g., `"1.2.3"`).
   *
   * @param _options - Command options parsed from the CLI.
   *   - `asDev` (`boolean`) – If `true`, simulates installation as a development dependency (`--save-dev`).
   *   - `pkgManager` (`boolean`) – If `true`, simulates installation using Yarn instead of NPM.
   *
   * @returns A `Promise<void>` that resolves once the simulated installation is complete.
   *
   * @example
   * ```ts
   * await addPkgService.install(['axios'], { asDev: false, pkgManager: true });
   * // → Simulates: yarn add axios
   * ```
   *
   * @throws {Error} If the simulated installation process fails (caught and handled internally).
   */
  async install(_params: string[], _options: Record<string, any>): Promise<void> {
    const [pkgName, version] = _params;
    const dev = _options.asDev ?? false;
    const yarn = _options.pkgManager ?? false;
    const fullName = version ? `${pkgName}@${version}` : pkgName;

    const tool = yarn ? 'yarn add' : `npm install${dev ? ' --save-dev' : ''}`;
    const command = `${tool} ${fullName}`;

    const spinner: Ora = ora(
      chalk.blue(`Installing ${chalk.bold(fullName)} using ${tool}...`),
    ).start();

    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      spinner.succeed(chalk.green(`✅ Package installed: ${chalk.bold(fullName)}`));
      console.log(chalk.gray(`> ${command}`));
    } catch {
      spinner.fail(chalk.red(`❌ Failed to install ${chalk.bold(fullName)}`));
    }
  }
}
