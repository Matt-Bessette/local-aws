import { Injectable } from '@nestjs/common';
import { AbstractActionHandler, AwsProperties, Format } from '../abstract-action.handler';
import { Action } from '../action.enum';
import * as Joi from 'joi';
import { KmsKeyAlias } from './kms-key-alias.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KmsKey } from './kms-key.entity';
import { ArnParts, breakdownArn } from '../util/breakdown-arn';

type QueryParams = {
  KeyId: string;
}

@Injectable()
export class DescribeKeyHandler extends AbstractActionHandler<QueryParams> {

  constructor(
    @InjectRepository(KmsKeyAlias)
    private readonly aliasRepo: Repository<KmsKeyAlias>,
    @InjectRepository(KmsKey)
    private readonly keyRepo: Repository<KmsKey>,
  ) {
    super();
  }

  format = Format.Json;
  action = Action.KmsDescribeKey;
  validator = Joi.object<QueryParams, true>({ 
    KeyId: Joi.string().required(),
  });

  protected async handle({ KeyId }: QueryParams, awsProperties: AwsProperties) {

    const searchable = KeyId.startsWith('arn') ? breakdownArn(KeyId) : { 
      service: 'kms',
      region: awsProperties.region,
      accountId: awsProperties.accountId,
      identifier: KeyId,
    };
    const [ type, pk ] = searchable.identifier.split('/');
    const keyId: Promise<string> = type === 'key' ? 
      Promise.resolve(pk) : 
      this.findKeyIdFromAlias(pk, searchable);
    

    const keyRecord = await this.keyRepo.findOne({ where: {
      id: await keyId,
      region: searchable.region,
      accountId: searchable.accountId,
    }});

    return {
      KeyMetadata: keyRecord.metadata,
    }
  }

  private async findKeyIdFromAlias(alias: string ,arn: ArnParts): Promise<string> {
    const record = await this.aliasRepo.findOne({ where: { 
      name: alias, 
      accountId: arn.accountId,
      region: arn.region,
    }});
    return record.targetKeyId;
  }
}
