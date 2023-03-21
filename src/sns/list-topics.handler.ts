import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractActionHandler, AwsProperties, Format } from '../abstract-action.handler';
import { Action } from '../action.enum';
import { SnsTopic } from './sns-topic.entity';
import * as Joi from 'joi';

type QueryParams = {
  NextToken: number;
}

@Injectable()
export class ListTopicsHandler extends AbstractActionHandler {
  
  constructor(
    @InjectRepository(SnsTopic)
    private readonly snsTopicRepo: Repository<SnsTopic>,
  ) {
    super();
  }

  format = Format.Xml;
  action = Action.SnsListTopics;
  validator = Joi.object<QueryParams, true>({ NextToken: Joi.number().default(0) });

  protected async handle({ NextToken: skip }: QueryParams, awsProperties: AwsProperties) {
    
    const [ topics, total ] = await this.snsTopicRepo.findAndCount({ order: { name: 'DESC' }, take: 100, skip });
    const response = { Topics: topics.map(t => ({ Topic: { TopicArn: t.topicArn } }))};

    if (total >= 100) {
      return {
        ...response,
        NextToken: `${skip + 100}`
      }
    }

    return response;
  }
}
