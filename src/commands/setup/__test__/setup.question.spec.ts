import 'reflect-metadata';
import { SetupQuestion } from '../questions/setup.question';
import { config } from '../../../config';

describe('SetupQuestion', () => {
  let instance: SetupQuestion;

  beforeEach(() => {
    const cliConfig = config();
    instance = new SetupQuestion(cliConfig as any);
  });

  describe('parsers', () => {
    it('should trim and return project name', () => {
      expect(instance.parseProjectName('  my-project  ')).toBe('my-project');
    });

    it('should return the same port number', () => {
      expect(instance.parsePort(3000)).toBe(3000);
    });

    it('should return the same boolean for confirm', () => {
      expect(instance.parseConfirm(true)).toBe(true);
      expect(instance.parseConfirm(false)).toBe(false);
    });

    it('should return the selected env', () => {
      expect(instance.parseEnv('dev')).toBe('dev');
    });

    it('should return the selected features array', () => {
      expect(instance.parseFeatures(['Logger', 'S3'])).toEqual(['Logger', 'S3']);
    });

    it('should return the same password string', () => {
      expect(instance.parsePassword('secret123')).toBe('secret123');
    });

    it('should return the selected database', () => {
      expect(instance.parseDatabase('mongo')).toBe('mongo');
    });

    it('should return the replicas number', () => {
      expect(instance.parseReplicas(2)).toBe(2);
    });

    it('should return the notes text', () => {
      expect(instance.parseNotes('multiline text')).toBe('multiline text');
    });
  });

  describe('decorators metadata (validations & choices)', () => {
    /**
     * Extract question definitions from all plausible metadata targets.
     * @Question metadata can be attached to:
     *  - class constructor
     *  - class prototype
     *  - method property (proto, 'methodName')
     *  - method function itself (proto[method])
     */
    const getQuestionDefs = (): Record<string, any> => {
      const ctor = SetupQuestion as unknown as object;
      const proto = SetupQuestion.prototype as any;

      const methodNames = Object.getOwnPropertyNames(proto).filter(
        (n) => typeof proto[n] === 'function' && n !== 'constructor',
      );

      const defsByName: Record<string, any> = {};

      const collectFromMeta = (meta: any) => {
        if (!meta) return;

        const pushItem = (item: any) => {
          if (
            item &&
            typeof item === 'object' &&
            (item.name || item.type || item.message || item.validate || item.choices)
          ) {
            if (typeof item.name === 'string') {
              defsByName[item.name] = item;
            }
          }
        };

        if (Array.isArray(meta)) {
          for (const m of meta) {
            if (Array.isArray(m?.questions)) {
              for (const q of m.questions) pushItem(q);
            } else {
              pushItem(m);
            }
          }
        } else if (typeof meta === 'object') {
          if (Array.isArray(meta.questions)) {
            for (const q of meta.questions) pushItem(q);
          } else {
            pushItem(meta);
          }
        }
      };

      const readAllKeys = (target: any, propertyKey?: string | symbol) => {
        try {
          const keys = Reflect.getMetadataKeys(target, propertyKey as any) as any[];
          for (const k of keys) {
            collectFromMeta(Reflect.getMetadata(k, target, propertyKey as any));
          }
        } catch {
          /* ignore */
        }
      };

      // Class-level (constructor & prototype)
      readAllKeys(ctor);
      readAllKeys(proto);

      // Method-level (property & function targets)
      for (const name of methodNames) {
        readAllKeys(proto, name);
        const fn = proto[name];
        readAllKeys(fn);
      }

      return defsByName;
    };

    it('should validate projectName: empty -> error; non-empty -> true', () => {
      const defs = getQuestionDefs();
      const q = defs['projectName'];
      expect(q).toBeTruthy();
      expect(typeof q.validate).toBe('function');

      expect(q.validate('')).toBe('Project name cannot be empty');
      expect(q.validate('  ok  ')).toBe(true);
    });

    it('should validate port range and type', () => {
      const defs = getQuestionDefs();
      const q = defs['port'];
      expect(q).toBeTruthy();
      expect(typeof q.validate).toBe('function');

      expect(q.validate(0)).toBe(true);
      expect(q.validate(65535)).toBe(true);
      expect(q.validate(-1)).toBe('Invalid port (0..65535)');
      expect(q.validate(70000)).toBe('Invalid port (0..65535)');
      expect(q.validate(3.14)).toBe('Invalid port (0..65535)');
    });

    it('should expose env choices from cliConfig and default options', () => {
      const defs = getQuestionDefs();
      const q = defs['env'];
      expect(q).toBeTruthy();
      expect(typeof q.choices).toBe('function');

      const envs = q.choices.call(instance);
      expect(envs).toEqual((config() as any).envs);

      expect(q.default).toBe('local');
      expect(q.loop).toBe(false);
      expect(q.pageSize).toBe(3);
    });

    it('should validate features: require at least one', () => {
      const defs = getQuestionDefs();
      const q = defs['features'];
      expect(q).toBeTruthy();
      expect(Array.isArray(q.choices)).toBe(true);
      expect(typeof q.validate).toBe('function');

      expect(q.validate([])).toBe('Select at least one feature');
      expect(q.validate(['Logger'])).toBe(true);
    });

    it('should validate adminPassword: min length 6 and mask "*"', () => {
      const defs = getQuestionDefs();
      const q = defs['adminPassword'];
      expect(q).toBeTruthy();
      expect(typeof q.validate).toBe('function');

      expect(q.validate('12345')).toBe('Password must be at least 6 characters');
      expect(q.validate('123456')).toBe(true);
      expect(q.mask).toBe('*');
    });

    it('should provide database choices with default "m"', () => {
      const defs = getQuestionDefs();
      const q = defs['database'];
      expect(q).toBeTruthy();
      expect(Array.isArray(q.choices)).toBe(true);

      const values = q.choices.map((c: any) => c.value);
      expect(values).toEqual(['mongo', 'postgres', 'sqlite']);
      expect(q.default).toBe('m');
    });

    it('should validate replicas: > 0', () => {
      const defs = getQuestionDefs();
      const q = defs['replicas'];
      expect(q).toBeTruthy();
      expect(typeof q.validate).toBe('function');

      expect(q.validate(0)).toBe('It must be a number greater than 0');
      expect(q.validate(-1)).toBe('It must be a number greater than 0');
      expect(q.validate(2)).toBe(true);
    });

    it('should define editor question for notes with postfix ""', () => {
      const defs = getQuestionDefs();
      const q = defs['notes'];
      expect(q).toBeTruthy();
      expect(q.type).toBe('editor');
      expect(q.postfix).toBe('');
    });
  });
});
