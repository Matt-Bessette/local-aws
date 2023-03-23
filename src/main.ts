import { ClassSerializerInterceptor } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';
import { CommonConfig } from './config/common-config.interface';
import { ConfigService } from '@nestjs/config';
const bodyParser = require('body-parser');

(async () => {

  const app = await NestFactory.create(AppModule);
  app.use(morgan('dev'));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.use(bodyParser.json({ type: 'application/x-amz-json-1.1'}));

  const configService: ConfigService<CommonConfig> = app.get(ConfigService)

  await app.listen(configService.get('PORT'), () => console.log(`Listening on port ${configService.get('PORT')}`));
})();
