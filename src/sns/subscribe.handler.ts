import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractActionHandler, AwsProperties, Format } from '../abstract-action.handler';
import { Action } from '../action.enum';
import * as Joi from 'joi';
import { TagsService } from '../aws-shared-entities/tags.service';
import { AttributesService } from '../aws-shared-entities/attributes.service';
import { SnsTopicSubscription } from './sns-topic-subscription.entity';
import * as uuid from 'uuid';

type QueryParams = {
  TopicArn: string;
  Protocol: string;
  Endpoint?: string;
}

@Injectable()
export class SubscribeHandler extends AbstractActionHandler<QueryParams> {

  constructor(
    @InjectRepository(SnsTopicSubscription)
    private readonly snsTopicSubscription: Repository<SnsTopicSubscription>,
    private readonly tagsService: TagsService,
    private readonly attributeService: AttributesService,
  ) {
    super();
  }

  format = Format.Xml;
  action = Action.SnsSubscribe;
  validator = Joi.object<QueryParams, true>({
    Endpoint: Joi.string(),
    TopicArn: Joi.string().required(),
    Protocol: Joi.string().required(),
  });

  protected async handle(params: QueryParams, awsProperties: AwsProperties) {

    const subscription = await this.snsTopicSubscription.create({
      id: uuid.v4(),
      topicArn: params.TopicArn,
      protocol: params.Protocol,
      endpoint: params.Endpoint,
      accountId: awsProperties.accountId,
      region: awsProperties.region,
    }).save();

    const tags = TagsService.tagPairs(params);
    await this.tagsService.createMany(subscription.arn, tags);

    const attributes = AttributesService.attributePairs(params);
    await this.attributeService.createMany(subscription.arn, attributes);

    return { SubscriptionArn: subscription.arn };
  }
}
