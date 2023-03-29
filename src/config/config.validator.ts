import * as Joi from 'joi';
import { CommonConfig } from './common-config.interface';

export const configValidator = Joi.object<CommonConfig, true>({
  AWS_ACCOUNT_ID: Joi.string().required(),
  AWS_REGION: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  DB_LOGGING: Joi.boolean().required(),
  DB_SYNCHRONIZE: Joi.boolean().valid(true).required(),
  HOST: Joi.string().required(),
  PORT: Joi.number().required(),
  PROTO: Joi.string().valid('http', 'https').required(),
});
