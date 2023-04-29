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
export class DeleteSecretHandler extends AbstractActionHandler {
  
  constructor(
    private readonly secretService: SecretService,
  ) {
    super();
  }

  format = Format.Json;
  action = Action.SecretsManagerDeleteSecret;
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

    secret.deletionDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString();
    await secret.save();
    return {
      Arn: secret.arn,
      DeletionDate: secret.deletionDate,
      Name: secret.name,
    }
  }
}
