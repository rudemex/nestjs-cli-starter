import { Inject, Injectable } from '@nestjs/common';
import { Question, QuestionSet } from 'nest-commander';
import chalk from 'chalk';
import { config } from '../../../config';
import { ConfigType } from '@nestjs/config';

@QuestionSet({ name: 'setup' })
@Injectable()
export class SetupQuestions {
  constructor(@Inject(config.KEY) private readonly cliConfig: ConfigType<typeof config>) {}

  @Question({
    type: 'input',
    name: 'projectName',
    message: chalk.cyan('¿Cómo se llama tu proyecto?'),
    default: 'mi-proyecto',
    validate: (val: string) => val.length > 0 || 'El nombre no puede estar vacío',
  })
  parseProjectName(val: string): string {
    return val.trim();
  }

  @Question({
    type: 'number',
    name: 'port',
    message: '¿Qué puerto querés usar?',
    default: 3000,
    validate: (val: number) => (val >= 0 && val <= 65535) || 'Puerto inválido',
  })
  parsePort(val: number): number {
    return val;
  }

  @Question({
    type: 'confirm',
    name: 'confirm',
    message: '¿Deseás continuar?',
    default: true,
  })
  parseConfirm(val: boolean): boolean {
    return val;
  }

  @Question({
    type: 'list',
    name: 'env',
    message: '¿Qué entorno querés configurar?',
    choices(this: SetupQuestions) {
      return this.cliConfig.envs;
    },
    default: 'local',
    loop: false,
  })
  parseEnv(val: string): string {
    return val;
  }

  @Question({
    type: 'checkbox',
    name: 'features',
    message: '¿Qué funcionalidades querés habilitar?',
    choices: ['Auth', 'SQS', 'S3', 'Logger'],
    default: ['Logger'],
    validate: (val: string[]) => val.length > 0 || 'Seleccioná al menos una',
  })
  parseFeatures(val: string[]): string[] {
    return val;
  }

  @Question({
    type: 'password',
    name: 'adminPassword',
    message: 'Ingresá la contraseña del admin:',
    mask: '*',
    validate: (val: string) => val.length >= 6 || 'Debe tener al menos 6 caracteres',
  })
  parsePassword(val: string): string {
    return val;
  }

  @Question({
    type: 'expand',
    name: 'database',
    message: '¿Qué base de datos querés usar?',
    choices: [
      { key: 'm', name: 'MongoDB', value: 'mongo' },
      { key: 'p', name: 'PostgreSQL', value: 'postgres' },
      { key: 's', name: 'SQLite', value: 'sqlite' },
    ],
    default: 'm',
  })
  parseDatabase(val: string): string {
    return val;
  }

  @Question({
    type: 'number',
    name: 'replicas',
    message: '¿Cuántas instancias deseás lanzar?',
    default: 1,
    validate: (input: number) => (input > 0 ? true : 'Debe ser un número mayor a 0'),
  })
  parseReplicas(val: number): number {
    return val;
  }

  /*@Question({
    type: 'input',
    name: 'email',
    message: 'Ingresá tu email:',
    validate: (input: string): true | string => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(input) ? true : '📧 El email no es válido';
    },
  })
  parseEmail(val: string): string {
    return val.trim();
  }*/

  @Question({
    type: 'editor',
    name: 'notes',
    message: 'Notas opcionales (se abre un editor)',
  })
  parseNotes(val: string): string {
    return val;
  }
}
