import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractActionHandler, AwsProperties, Format } from '../abstract-action.handler';
import { Action } from '../action.enum';
import * as Joi from 'joi';
import { Secret } from './secret.entity';
import * as uuid from 'uuid';

type QueryParams = {
  Name: string;
  Description: string;
  SecretString: string;
  ClientRequestToken: string;
}

@Injectable()
export class CreateSecretHandler extends AbstractActionHandler<QueryParams> {

  constructor(
    @InjectRepository(Secret)
    private readonly secretRepo: Repository<Secret>,
  ) {
    super();
  }

  format = Format.Json;
  action = Action.SecretsManagerCreateSecret;
  validator = Joi.object<QueryParams, true>({ 
    Name: Joi.string().required(),
    Description: Joi.string().allow('', null),
    SecretString: Joi.string().allow('', null),
    ClientRequestToken: Joi.string().required(),
  });

  protected async handle(params: QueryParams, awsProperties: AwsProperties) {

    const { Name: name, Description: description, SecretString: secretString, ClientRequestToken } = params;

    const secret = await this.secretRepo.create({
      versionId: ClientRequestToken,
      description,
      name,
      secretString,
      accountId: awsProperties.accountId,
      region: awsProperties.region,
    }).save();

    return { ARN: secret.arn, VersionId: secret.versionId, Name: secret.name };
  }
}
