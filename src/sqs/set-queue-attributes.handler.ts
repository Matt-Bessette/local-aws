import { BadRequestException, Injectable } from '@nestjs/common';
import { AbstractActionHandler, AwsProperties, Format } from '../abstract-action.handler';
import { Action } from '../action.enum';
import * as Joi from 'joi';
import { AttributesService } from '../aws-shared-entities/attributes.service';
import { InjectRepository } from '@nestjs/typeorm';
import { SqsQueue } from './sqs-queue.entity';
import { Repository } from 'typeorm';

type QueryParams = {
  'Attribute.Name': string;
  'Attribute.Value': string;
  __path: string;
}

@Injectable()
export class SetQueueAttributesHandler extends AbstractActionHandler<QueryParams> {

  constructor(
    @InjectRepository(SqsQueue)
    private readonly sqsQueueRepo: Repository<SqsQueue>,
    private readonly attributeService: AttributesService,
  ) {
    super();
  }

  format = Format.Xml;
  action = Action.SqsSetQueueAttributes;
  validator = Joi.object<QueryParams, true>({ 
    'Attribute.Name': Joi.string().required(),
    'Attribute.Value': Joi.string().required(),
    __path: Joi.string().required(),
  });

  protected async handle(params: QueryParams, awsProperties: AwsProperties) {
    const [accountId, name] = SqsQueue.getAccountIdAndNameFromPath(params.__path);
    const queue = await this.sqsQueueRepo.findOne({ where: { accountId , name  } });
    
    if(!queue) {
      throw new BadRequestException('ResourceNotFoundException');
    }

    await this.attributeService.create({ name: params['Attribute.Name'], value: params['Attribute.Value'], arn: queue.arn });
  }
}
