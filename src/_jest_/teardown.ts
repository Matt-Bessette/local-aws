import { INestApplication } from '@nestjs/common';

const globalTeardown = async (_globalConfig, _projectConfig) => {

  await (globalThis.__NESTAPP__ as INestApplication).close();
}

export default globalTeardown;
