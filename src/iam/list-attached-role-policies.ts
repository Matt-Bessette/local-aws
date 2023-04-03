import { Injectable, NotFoundException } from '@nestjs/common';
import { AbstractActionHandler, AwsProperties, Format } from '../abstract-action.handler';
import { Action } from '../action.enum';
import * as Joi from 'joi';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { IamRole } from './iam-role.entity';
import { IamRolePolicyAttachment } from './iam-role-policy-attachment.entity';
import { IamPolicy } from './iam-policy.entity';
import { breakdownArn } from '../util/breakdown-arn';

type QueryParams = {
  RoleName: string;
}

@Injectable()
export class ListAttachedRolePoliciesHandler extends AbstractActionHandler<QueryParams> {

  constructor(
    @InjectRepository(IamRole)
    private readonly roleRepo: Repository<IamRole>,
    @InjectRepository(IamPolicy)
    private readonly policyRepo: Repository<IamPolicy>,
    @InjectRepository(IamRolePolicyAttachment)
    private readonly attachmentRepo: Repository<IamRolePolicyAttachment>,
  ) {
    super();
  }

  format = Format.Xml;
  action = Action.IamListAttachedRolePolicies;
  validator = Joi.object<QueryParams, true>({ 
    RoleName: Joi.string().required(),
  });

  protected async handle({ RoleName }: QueryParams, awsProperties: AwsProperties) {

    const role = await this.roleRepo.findOne({ where: { roleName: RoleName, accountId: awsProperties.accountId } });

    if (!role) {
      throw new NotFoundException('NoSuchEntity', 'The request was rejected because it referenced a resource entity that does not exist. The error message describes the resource.');
    }

    const attachments = await this.attachmentRepo.find({ where: { roleId: role.id } })
    const policyIds = attachments.map(({ policyArn }) => breakdownArn(policyArn)).map(({ identifier }) => identifier.split('/')[1]);
    const policies = await this.policyRepo.find({ where: { name: In(policyIds), isDefault: true } });

    return {
      AttachedPolicies: {
        member: [role.assumeRolePolicyDocument, ...policies].map(p => ({
          PolicyName: p.name,
          PolicyArn: p.arn,
        })),
      }
    }
  }
}
