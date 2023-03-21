import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractActionHandler, AwsProperties, Format } from '../abstract-action.handler';
import { Action } from '../action.enum';
import { SnsTopic } from './sns-topic.entity';
import * as Joi from 'joi';
import { TagsService } from '../aws-shared-entities/tags.service';

type QueryParams = {
  Name: string;
}

@Injectable()
export class CreateTopicHandler extends AbstractActionHandler<QueryParams> {

  constructor(
    @InjectRepository(SnsTopic)
    private readonly snsTopicRepo: Repository<SnsTopic>,
    private readonly tagsService: TagsService,
  ) {
    super();
  }

  format = Format.Xml;
  action = Action.SnsCreateTopic;
  validator = Joi.object<QueryParams, true>({ Name: Joi.string().required() });

  protected async handle(params: QueryParams, awsProperties: AwsProperties) {

    const { Name: name } = params;

    const topic = await this.snsTopicRepo.create({ 
      name,
      accountId: awsProperties.accountId,
      region: awsProperties.region,
    }).save();

    const tags = TagsService.tagPairs(params);
    await this.tagsService.createMany(topic.topicArn, tags);

    return { TopicArn: topic.topicArn };
  }
}
