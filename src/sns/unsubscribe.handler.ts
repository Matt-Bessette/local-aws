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
  SubscriptionArn: string;
}

@Injectable()
export class UnsubscribeHandler extends AbstractActionHandler<QueryParams> {

  constructor(
    @InjectRepository(SnsTopicSubscription)
    private readonly snsTopicSubscription: Repository<SnsTopicSubscription>,
    private readonly tagsService: TagsService,
    private readonly attributeService: AttributesService,
  ) {
    super();
  }

  format = Format.Xml;
  action = Action.SnsUnsubscribe;
  validator = Joi.object<QueryParams, true>({
    SubscriptionArn: Joi.string().required(),
  });

  protected async handle(params: QueryParams, awsProperties: AwsProperties) {

    const id = params.SubscriptionArn.split(':').pop();
    const subscription = await this.snsTopicSubscription.findOne({ where: { id } });

    await this.tagsService.deleteByArn(subscription.arn);
    await this.attributeService.deleteByArn(subscription.arn);
    await this.snsTopicSubscription.delete({ id });
  }
}
