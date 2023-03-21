import { CommonConfig } from "./common-config.interface";

export default (): CommonConfig => ({
  AWS_ACCOUNT_ID: '123456789012',
  AWS_REGION: 'us-east-1',
  DB_DATABASE: ':memory:', // 'local-aws.sqlite', // :memory:
  DB_LOGGING: true,
  DB_SYNCHRONIZE: true,
});
