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

    const name = Secret.getNameFromSecretId(SecretId);
    const secret = await this.secretRepo.findOne({ where: { name }, order: { createdAt: 'DESC' } });

    if (!secret) {
      throw new BadRequestException('ResourceNotFoundException', "Secrets Manager can't find the resource that you asked for.");
    }

    const tags = await this.tagsService.getByArn(secret.arn);
    const listOfTagPairs = TagsService.getJsonSafeTagsMap(tags);

    return {
      "ARN": secret.arn,
      "CreatedDate": new Date(secret.createdAt).toISOString(),
      "DeletedDate": null,
      "Description": secret.description,
      "KmsKeyId": "",
      "LastChangedDate": new Date(secret.createdAt).toISOString(),
      "LastRotatedDate": null,
      "Name": secret.name,
      "OwningService": secret.accountId,
      "PrimaryRegion": secret.region,
      "ReplicationStatus": [],
      "RotationEnabled": false,
      "Tags": listOfTagPairs,
    }
  }
}
