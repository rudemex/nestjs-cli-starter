import { Injectable } from '@nestjs/common';
import chalk from 'chalk';

@Injectable()
export class AddApiService {
  generate(resource: string, crud: boolean, tests: boolean): void {
    console.log(chalk.cyan(`✨ Generating API: ${resource}`));
    if (crud) console.log(chalk.green('✔ CRUD methods included'));
    if (tests) console.log(chalk.green('🧪 Test files scaffolded'));
    // Aquí iría la lógica de generación de archivos
  }
}
