import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractActionHandler, AwsProperties, Format } from '../abstract-action.handler';
import { Action } from '../action.enum';
import * as Joi from 'joi';
import { Secret } from './secret.entity';
import { AttributesService } from '../aws-shared-entities/attributes.service';

type QueryParams = {
  SecretId: string;
  ResourcePolicy: string;
}

@Injectable()
export class PutResourcePolicyHandler extends AbstractActionHandler {
  
  constructor(
    @InjectRepository(Secret)
    private readonly secretRepo: Repository<Secret>,
    private readonly attributesService: AttributesService,
  ) {
    super();
  }

  format = Format.Json;
  action = Action.SecretsManagerPutResourcePolicy;
  validator = Joi.object<QueryParams, true>({ 
    SecretId: Joi.string().required(),
    ResourcePolicy: Joi.string().required(),
  });

  protected async handle({ SecretId, ResourcePolicy }: QueryParams, awsProperties: AwsProperties) {

    const name = Secret.getNameFromSecretId(SecretId);
    const secret = await this.secretRepo.findOne({ where: { name }, order: { createdAt: 'DESC' } });

    if (!secret) {
      throw new BadRequestException('ResourceNotFoundException', "Secrets Manager can't find the resource that you asked for.");
    }

    await this.attributesService.createResourcePolicy(secret.arn, ResourcePolicy);
    return {
      ARN: secret.arn,
      Name: secret.name,
    }
  }
}
