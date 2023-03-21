import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractActionHandler, AwsProperties, Format } from '../abstract-action.handler';
import { Action } from '../action.enum';
import * as Joi from 'joi';
import { SnsTopicSubscription } from './sns-topic-subscription.entity';
import { AttributesService } from '../aws-shared-entities/attributes.service';

type QueryParams = {
   SubscriptionArn: string;
}

@Injectable()
export class GetSubscriptionAttributesHandler extends AbstractActionHandler {
  
  constructor(
    @InjectRepository(SnsTopicSubscription)
    private readonly snsTopicSubscriptionRepo: Repository<SnsTopicSubscription>,
    private readonly attributeService: AttributesService,
  ) {
    super();
  }

  format = Format.Xml;
  action = Action.SnsGetSubscriptionAttributes;
  validator = Joi.object<QueryParams, true>({ SubscriptionArn: Joi.string().required() });

  protected async handle({ SubscriptionArn }: QueryParams, awsProperties: AwsProperties) {
    
    const id = SubscriptionArn.split(':')[-1];
    const subscription = await this.snsTopicSubscriptionRepo.findOne({ where: { id }});
    const attributes = await this.attributeService.getByArn(SubscriptionArn);
    const attributeMap = attributes.reduce((m, a) => {
      m[a.name] = a.value;
      return m;
    }, {});

    const response = {
      ConfirmationWasAuthenticated: 'true',
      PendingConfirmation: 'false',
      Owner: subscription.accountId,
      SubscriptionArn: subscription.arn,
      TopicArn: subscription.topicArn,
      ...attributeMap,
      TracingConfig: attributeMap['TracingConfig'] ?? 'PassThrough',
    }

    return AttributesService.getXmlSafeAttributesMap(response);
  }
}
