import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';

const globalSetup = async (_globalConfig, _projectConfig) => {

  const module: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app: INestApplication = module.createNestApplication();
  await app.listen(4566);

  globalThis.__TESTMODULE__ = module;
  globalThis.__NESTAPP__ = app;
  globalThis.__ENDPOINT__ = 'http://127.0.0.1:4566';
}

export default globalSetup;
