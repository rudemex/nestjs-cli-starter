import { CommandRunner, Command, Option, Help } from 'nest-commander';

@Command({
  name: 'basic',
  arguments: '<task> [extra]', // Uno requerido, uno opcional
  description: 'A parameter parse example that shows all Command options',
  aliases: ['b', 'simple', 'run'], // Aliases disponibles
  argsDescription: {
    task: 'The main task to execute',
    extra: 'An optional extra argument',
  },
  options: {
    isDefault: false, // Este comando no será el default si hay varios
    hidden: false, // Mostrar en el help
  },
  subCommands: [], // Aquí podrías pasar subcomandos si los tuvieras
})
export class BasicCommand extends CommandRunner {
  constructor() {
    super();
  }

  async run(passedParams: string[], options?: Record<string, any>): Promise<void> {
    console.log('🧪 CLI Params:', passedParams);
    console.log('⚙️ CLI Options:', options);
  }

  @Option({
    flags: '-n, --number <number>',
    description: 'A basic number parser with all Option properties',
    defaultValue: 42, // Valor por defecto
    required: false, // Si fuera true, lo exige como obligatorio
    name: 'number', // Nombre interno para OptionChoicesFor (no necesario si no lo usás)
    choices: ['1', '2', '3', '42'], // Podés poner true si vas a usar @OptionChoicesFor
  })
  parseNumber(val: string): number {
    return Number(val);
  }

  @Help('afterAll')
  printExample(): string {
    return `
📌 Example usage:

  $ cli basic build --number 3
  👉 Runs the 'build' task with number 3

  $ cli basic deploy staging --number 42
  👉 Deploys to staging with number 42
`;
  }
}
