import { Injectable } from '@nestjs/common';
import chalk from 'chalk';
import ora, { Ora } from 'ora';

@Injectable()
export class AddPkgService {
  /**
   * Simulates the installation of a package using a loading spinner.
   *
   * @param _params - Positional arguments: [0] is the package name, [1] is the optional version.
   * @param _options - Command options (`asDev`, `pkgManager`, etc.).
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
      // Simulate installation delay
      await new Promise((resolve) => setTimeout(resolve, 3000));

      spinner.succeed(chalk.green(`✅ Package installed: ${chalk.bold(fullName)}`));
      console.log(chalk.gray(`> ${command}`));
    } catch {
      spinner.fail(chalk.red(`❌ Failed to install ${chalk.bold(fullName)}`));
    }
  }
}
