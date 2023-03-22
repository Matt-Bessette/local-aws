export interface CreateSecretDto {
  versionId?: string;
  name: string;
  description?: string;
  secretString?: string;
  accountId: string;
  region: string;
}
