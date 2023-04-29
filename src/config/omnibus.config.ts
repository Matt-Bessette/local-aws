import { CommonConfig } from "./common-config.interface";
import { configValidator } from './config.validator';

export default (): CommonConfig => {
  
  const { error, value } = configValidator.validate({
    AWS_ACCOUNT_ID: process.env.AWS_ACCOUNT_ID ?? '000000000000',
    AWS_REGION: process.env.AWS_REGION ?? 'us-east-1',
    DB_DATABASE: process.env.PERSISTANCE ?? ':memory:',
    DB_LOGGING: process.env.DEBUG ? true : false,
    DB_SYNCHRONIZE: true,
    HOST: process.env.HOST ?? 'localhost',
    PROTO: process.env.PROTOCOL ?? 'http',
    PORT: process.env.PORT as any ?? 4566,
  }, { abortEarly: false });

  if (error) {
    throw error;
  }

  return value;
}
