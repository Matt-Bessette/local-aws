export type ArnParts = {
  service: string;
  region: string;
  accountId: string;
  identifier: string;
}

export const breakdownArn = (arn: string): ArnParts => {
  if (!arn.startsWith('arn')) {
    throw new Error('Invalid arn');
  }

  const [_arn, _aws, service, region, accountId, ...identifierData] = arn.split(':');

  return {
    service,
    region,
    accountId,
    identifier: identifierData.join(':'),
  }
}
