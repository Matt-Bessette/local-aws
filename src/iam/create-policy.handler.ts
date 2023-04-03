import { Injectable } from '@nestjs/common';
import { AbstractActionHandler, AwsProperties, Format } from '../abstract-action.handler';
import { Action } from '../action.enum';
import * as Joi from 'joi';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as uuid from 'uuid';
import { IamPolicy } from './iam-policy.entity';

type QueryParams = {
  PolicyName: string;
  PolicyDocument: string;
}

@Injectable()
export class CreatePolicyHandler extends AbstractActionHandler<QueryParams> {

  constructor(
    @InjectRepository(IamPolicy)
    private readonly policyRepo: Repository<IamPolicy>,
  ) {
    super();
  }

  format = Format.Xml;
  action = Action.IamCreatePolicy;
  validator = Joi.object<QueryParams, true>({ 
    PolicyName: Joi.string().required(),
    PolicyDocument: Joi.string().required(),
  });

  protected async handle({ PolicyName, PolicyDocument }: QueryParams, awsProperties: AwsProperties) {

    const policy = await this.policyRepo.create({
      id: uuid.v4(),
      name: PolicyName,
      document: PolicyDocument,
      accountId: awsProperties.accountId,
    }).save();

    return {
      Policy: {
        PolicyName: policy.name,
        DefaultVersionId: 'v1',
        PolicyId: policy.id,
        Path: '/',
        Arn: policy.arn,
        AttachmentCount: 0,
        CreateDate: new Date(policy.createdAt).toISOString(),
        UpdateDate: new Date(policy.updatedAt).toISOString(),
      }
    }
  }
}
