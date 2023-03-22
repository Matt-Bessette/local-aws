import { BadRequestException, Injectable } from '@nestjs/common';
import { AbstractActionHandler, AwsProperties, Format } from '../abstract-action.handler';
import { Action } from '../action.enum';
import * as Joi from 'joi';
import { Secret } from './secret.entity';
import { SecretService } from './secret.service';

type QueryParams = {
  SecretId: string;
  VersionId: string;
}

@Injectable()
export class GetSecretValueHandler extends AbstractActionHandler {
  
  constructor(
    private readonly secretService: SecretService,
  ) {
    super();
  }

  format = Format.Json;
  action = Action.SecretsManagerGetSecretValue;
  validator = Joi.object<QueryParams, true>({ 
    SecretId: Joi.string().required(),
    VersionId: Joi.string().allow(null, ''),
  });

  protected async handle({ SecretId, VersionId}: QueryParams, awsProperties: AwsProperties) {

    const name = Secret.getNameFromSecretId(SecretId);
    const secret = VersionId ? 
      await this.secretService.findByNameAndVersion(name, VersionId) :
      await this.secretService.findLatestByNameAndRegion(name, awsProperties.region);

    if (!secret) {
      throw new BadRequestException('ResourceNotFoundException', "Secrets Manager can't find the resource that you asked for.");
    }

    return {
      ARN: secret.arn,
      CreatedDate: secret.createdAt,
      Name: secret.name,
      SecretString: secret.secretString,
      VersionId: secret.versionId,
    }
  }
}
