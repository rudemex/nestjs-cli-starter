import { registerAs } from '@nestjs/config';
import * as PACKAGE_JSON from '../../package.json';

export default registerAs('config', (): any => ({
  project: {
    name: PACKAGE_JSON.name,
    version: PACKAGE_JSON.version,
    description: PACKAGE_JSON.description,
    author: PACKAGE_JSON.author,
    repository: PACKAGE_JSON.repository,
    bugs: PACKAGE_JSON.bugs,
    homepage: PACKAGE_JSON.homepage,
    command: Object.keys(PACKAGE_JSON.bin || {})[0],
  },
}));
