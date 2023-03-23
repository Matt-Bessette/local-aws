import { CommonConfig } from "./common-config.interface";

export default (): CommonConfig => ({
  AUDIT: process.env.DEBUG ? true : false,
  AWS_ACCOUNT_ID: process.env.AWS_ACCOUNT_ID,
  AWS_REGION: process.env.AWS_REGION,
  DB_DATABASE: process.env.PERSISTANCE,
  DB_LOGGING: process.env.DEBUG ? true : false,
  DB_SYNCHRONIZE: true,
  HOST: process.env.HOST,
  PROTO: process.env.PROTOCOL,
  PORT: Number(process.env.PORT),
});
