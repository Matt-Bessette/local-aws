import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractActionHandler, AwsProperties, Format } from '../abstract-action.handler';
import { Action } from '../action.enum';
import * as Joi from 'joi';
import { Secret } from './secret.entity';
import { TagsService } from '../aws-shared-entities/tags.service';

type QueryParams = {
  SecretId: string;
}

@Injectable()
export class DescribeSecretHandler extends AbstractActionHandler {
  
  constructor(
    @InjectRepository(Secret)
    private readonly secretRepo: Repository<Secret>,
    private readonly tagsService: TagsService,
  ) {
    super();
  }

  format = Format.Json;
  action = Action.SecretsManagerDescribeSecret;
  validator = Joi.object<QueryParams, true>({ SecretId: Joi.string().required() });

  protected async handle({ SecretId }: QueryParams, awsProperties: AwsProperties) {
    
    const parts = SecretId.split(':');
    const name = parts.length > 1 ? parts[-1] : SecretId;

    const secret = await this.secretRepo.findOne({ where: { name } });

    if (!secret) {
      throw new BadRequestException('ResourceNotFoundException', "Secrets Manager can't find the resource that you asked for.");
    }

    const tags = await this.tagsService.getByArn(secret.arn);
    const listOfTagPairs = TagsService.getJsonSafeTagsMap(tags);

    return {
      "ARN": secret.arn,
      "CreatedDate": new Date(secret.createdAt).getMilliseconds(),
      "DeletedDate": 0,
      "Description": secret.description,
      "KmsKeyId": "",
      "LastAccessedDate": new Date().getMilliseconds(),
      "LastChangedDate": new Date(secret.createdAt).getMilliseconds(),
      "LastRotatedDate": 0,
      "Name": secret.name,
      "OwningService": secret.accountId,
      "PrimaryRegion": secret.region,
      "ReplicationStatus": [],
      "RotationEnabled": false,
      "Tags": listOfTagPairs,
   }
  }
}
