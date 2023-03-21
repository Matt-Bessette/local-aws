export interface CommonConfig {
  AWS_ACCOUNT_ID: string;
  AWS_REGION: string;
  DB_DATABASE: string;
  DB_LOGGING?: boolean;
  DB_SYNCHRONIZE?: boolean;
}
