import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractActionHandler, AwsProperties, Format } from '../abstract-action.handler';
import { Action } from '../action.enum';
import * as Joi from 'joi';
import { TagsService } from '../aws-shared-entities/tags.service';
import { SqsQueue } from './sqs-queue.entity';
import { AttributesService } from '../aws-shared-entities/attributes.service';

type QueryParams = {
  QueueName: string;
}

@Injectable()
export class CreateQueueHandler extends AbstractActionHandler<QueryParams> {

  constructor(
    @InjectRepository(SqsQueue)
    private readonly sqsQueueRepo: Repository<SqsQueue>,
    private readonly tagsService: TagsService,
    private readonly attributeService: AttributesService,
  ) {
    super();
  }

  format = Format.Xml;
  action = Action.SqsCreateQueue;
  validator = Joi.object<QueryParams, true>({ QueueName: Joi.string().required() });

  protected async handle(params: QueryParams, awsProperties: AwsProperties) {

    const { QueueName: name } = params;

    const queue = await this.sqsQueueRepo.create({ 
      name,
      accountId: awsProperties.accountId,
      region: awsProperties.region,
    }).save();

    const tags = TagsService.tagPairs(params);
    await this.tagsService.createMany(queue.arn, tags);

    const attributes = AttributesService.attributePairs(params);
    await this.attributeService.createMany(queue.arn, attributes);

    return { QueueUrl: queue.getUrl(awsProperties.host) };
  }
}
