export interface CommonConfig {
  AUDIT: boolean;
  AWS_ACCOUNT_ID: string;
  AWS_REGION: string;
  DB_DATABASE: string;
  DB_LOGGING?: boolean;
  DB_SYNCHRONIZE?: boolean;
  HOST: string;
  PORT: number;
  PROTO: string;
}
