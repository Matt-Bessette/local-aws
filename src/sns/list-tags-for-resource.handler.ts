import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractActionHandler, AwsProperties, Format } from '../abstract-action.handler';
import { Action } from '../action.enum';
import { SnsTopic } from './sns-topic.entity';
import * as Joi from 'joi';
import { TagsService } from '../aws-shared-entities/tags.service';

type QueryParams = {
  ResourceArn: string;
}

@Injectable()
export class ListTagsForResourceHandler extends AbstractActionHandler {
  
  constructor(
    private readonly tagsService: TagsService,
  ) {
    super();
  }

  format = Format.Xml;
  action = Action.SnsListTagsForResource;
  validator = Joi.object<QueryParams, true>({ ResourceArn: Joi.string().required() });

  protected async handle({ ResourceArn }: QueryParams, awsProperties: AwsProperties) {
    const tags = await this.tagsService.getByArn(ResourceArn);
    return TagsService.getXmlSafeAttributesMap(tags);
  }
}
