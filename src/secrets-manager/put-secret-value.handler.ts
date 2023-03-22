import { BadRequestException, Injectable } from '@nestjs/common';
import { AbstractActionHandler, AwsProperties, Format } from '../abstract-action.handler';
import { Action } from '../action.enum';
import * as Joi from 'joi';
import { Secret } from './secret.entity';
import { SecretService } from './secret.service';

type QueryParams = {
  ClientRequestToken?: string;
  SecretId: string;
  SecretString: string;
}

@Injectable()
export class PutSecretValueHandler extends AbstractActionHandler<QueryParams> {

  constructor(
    private readonly secretService: SecretService,
  ) {
    super();
  }

  format = Format.Json;
  action = Action.SecretsManagerPutSecretValue;
  validator = Joi.object<QueryParams, true>({ 
    ClientRequestToken: Joi.string(),
    SecretId: Joi.string().required(),
    SecretString: Joi.string(),
  });

  protected async handle(params: QueryParams, awsProperties: AwsProperties) {

    const { SecretId, SecretString: secretString, ClientRequestToken } = params;
    const name = Secret.getNameFromSecretId(SecretId);
    const oldSecret = await this.secretService.findLatestByNameAndRegion(name, awsProperties.region);

    if (!oldSecret) {
      throw new BadRequestException('ResourceNotFoundException', "Secrets Manager can't find the resource that you asked for.");
    }

    const secret = await this.secretService.create({
      versionId: ClientRequestToken,
      name: oldSecret.name,
      secretString,
      accountId: awsProperties.accountId,
      region: awsProperties.region,
    });

    return { ARN: secret.arn, VersionId: secret.versionId, Name: secret.name, VersionStages: [] }
  }
}
