import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractActionHandler, AwsProperties, Format } from '../abstract-action.handler';
import { Action } from '../action.enum';
import { SnsTopic } from './sns-topic.entity';
import * as Joi from 'joi';
import { AttributesService } from '../aws-shared-entities/attributes.service';
import { SnsTopicSubscription } from './sns-topic-subscription.entity';

type QueryParams = {
  TopicArn: string;
}

@Injectable()
export class GetTopicAttributesHandler extends AbstractActionHandler {
  
  constructor(
    @InjectRepository(SnsTopic)
    private readonly snsTopicRepo: Repository<SnsTopic>,
    @InjectRepository(SnsTopicSubscription)
    private readonly snsTopicSubscriptionRepo: Repository<SnsTopicSubscription>,
    private readonly attributeService: AttributesService,
  ) {
    super();
  }

  format = Format.Xml;
  action = Action.SnsGetTopicAttributes;
  validator = Joi.object<QueryParams, true>({ TopicArn: Joi.string().required() });

  protected async handle({ TopicArn }: QueryParams, awsProperties: AwsProperties) {
    
    const name = TopicArn.split(':').pop();
    const topic = await this.snsTopicRepo.findOne({ where: { name }});

    if (!topic) {
      throw new BadRequestException();
    }

    const attributes = await this.attributeService.getByArn(TopicArn);
    const attributeMap = attributes.reduce((m, a) => {
      m[a.name] = a.value;
      return m;
    }, {});

    const subscriptionCount = await this.snsTopicSubscriptionRepo.count({ where: { topicArn: TopicArn } });

    const response = {
      DisplayName: topic.name,
      Owner: topic.accountId,
      SubscriptionsConfirmed: `${subscriptionCount}`,
      SubscriptionsDeleted: '0',
      SubscriptionsPending: '0',
      TopicArn: topic.topicArn,
      ...attributeMap,
      TracingConfig: attributeMap['TracingConfig'] ?? 'PassThrough',
    }

    return AttributesService.getXmlSafeAttributesMap(response);
  }
}
