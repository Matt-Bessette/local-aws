import * as Joi from 'joi';
import { CommonConfig } from './common-config.interface';

export const configValidator = Joi.object<CommonConfig, true>({
  AUDIT: Joi.boolean().default(false),
  AWS_ACCOUNT_ID: Joi.string().default('000000000000'),
  AWS_REGION: Joi.string().default('us-east-1'),
  DB_DATABASE: Joi.string().default(':memory:'),
  DB_LOGGING: Joi.boolean().default(false),
  DB_SYNCHRONIZE: Joi.boolean().default(true),
  HOST: Joi.string().default('localhost'),
  PORT: Joi.number().default(8081),
  PROTO: Joi.string().valid('http', 'https').default('http'),
});
