import { ClassSerializerInterceptor } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';

(async () => {

  const port = 8081;
  const app = await NestFactory.create(AppModule);
  app.use(morgan('dev'));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  await app.listen(port, () => console.log(`Listening on port ${port}`));
})();
