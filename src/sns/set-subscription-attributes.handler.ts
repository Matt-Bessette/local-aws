import { Injectable } from '@nestjs/common';
import { AbstractActionHandler, AwsProperties, Format } from '../abstract-action.handler';
import { Action } from '../action.enum';
import * as Joi from 'joi';
import { AttributesService } from '../aws-shared-entities/attributes.service';

type QueryParams = {
  AttributeName: string;
  AttributeValue: string;
  TopicArn: string;
}

@Injectable()
export class SetSubscriptionAttributesHandler extends AbstractActionHandler<QueryParams> {

  constructor(
    private readonly attributeService: AttributesService,
  ) {
    super();
  }

  format = Format.Xml;
  action = Action.SnsSetSubscriptionAttributes;
  validator = Joi.object<QueryParams, true>({ 
    AttributeName: Joi.string().required(),
    AttributeValue: Joi.string().required(),
    TopicArn: Joi.string().required(),
  });

  protected async handle({ AttributeName, AttributeValue, TopicArn }: QueryParams, awsProperties: AwsProperties) {
    await this.attributeService.create({ name: AttributeName, value: AttributeValue, arn: TopicArn });
  }
}
