import { CommonConfig } from "./common-config.interface";

export default (): CommonConfig => ({
  AWS_ACCOUNT_ID: '000000000000',
  AWS_REGION: 'us-east-1',
  // DB_DATABASE: ':memory:',
  DB_DATABASE: 'local-aws.sqlite',
  DB_LOGGING: true,
  DB_SYNCHRONIZE: true,
  HOST: 'http://localhost:8081',
});
