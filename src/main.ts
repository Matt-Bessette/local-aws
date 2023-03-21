import { ClassSerializerInterceptor } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';
const bodyParser = require('body-parser');

(async () => {

  const port = 8081;
  const app = await NestFactory.create(AppModule);
  app.use(morgan('dev'));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.use(bodyParser.json({ type: 'application/x-amz-json-1.1'}));

  await app.listen(port, () => console.log(`Listening on port ${port}`));
})();
