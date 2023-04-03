import { Injectable } from '@nestjs/common';
import { AbstractActionHandler, AwsProperties, Format } from '../abstract-action.handler';
import { Action } from '../action.enum';
import * as Joi from 'joi';
import { KmsKeyAlias } from './kms-key-alias.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

type QueryParams = {
  AliasName: string;
  TargetKeyId: string;
}

@Injectable()
export class CreateAliasHandler extends AbstractActionHandler<QueryParams> {

  constructor(
    @InjectRepository(KmsKeyAlias)
    private readonly aliasRepo: Repository<KmsKeyAlias>,
  ) {
    super();
  }

  format = Format.Json;
  action = Action.KmsCreateAlias;
  validator = Joi.object<QueryParams, true>({ 
    AliasName: Joi.string().required(),
    TargetKeyId: Joi.string().required(),
  });

  protected async handle({ AliasName, TargetKeyId }: QueryParams, awsProperties: AwsProperties) {

    await this.aliasRepo.save({
      name: AliasName.split('/')[1],
      targetKeyId: TargetKeyId,
      accountId: awsProperties.accountId,
      region: awsProperties.region,
    });
  }
}
