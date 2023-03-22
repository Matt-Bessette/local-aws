import { Injectable } from '@nestjs/common';
import { AbstractActionHandler, AwsProperties, Format } from '../abstract-action.handler';
import { Action } from '../action.enum';
import * as Joi from 'joi';
import { SecretService } from './secret.service';

type QueryParams = {
  Name: string;
  Description: string;
  SecretString: string;
  ClientRequestToken?: string;
}

@Injectable()
export class CreateSecretHandler extends AbstractActionHandler<QueryParams> {

  constructor(
    private readonly secretService: SecretService,
  ) {
    super();
  }

  format = Format.Json;
  action = Action.SecretsManagerCreateSecret;
  validator = Joi.object<QueryParams, true>({ 
    Name: Joi.string().required(),
    Description: Joi.string().allow('', null),
    SecretString: Joi.string().allow('', null),
    ClientRequestToken: Joi.string(),
  });

  protected async handle(params: QueryParams, awsProperties: AwsProperties) {

    const { Name: name, Description: description, SecretString: secretString, ClientRequestToken } = params;

    const secret = await this.secretService.create({
      versionId: ClientRequestToken,
      description,
      name,
      secretString,
      accountId: awsProperties.accountId,
      region: awsProperties.region,
    });

    return { ARN: secret.arn, VersionId: secret.versionId, Name: secret.name };
  }
}
