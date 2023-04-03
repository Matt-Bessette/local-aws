import { Injectable } from '@nestjs/common';
import { AbstractActionHandler, AwsProperties, Format } from '../abstract-action.handler';
import { Action } from '../action.enum';
import * as Joi from 'joi';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as uuid from 'uuid';
import { IamPolicy } from './iam-policy.entity';
import { IamRolePolicyAttachment } from './iam-role-policy-attachment.entity';
import { IamRole } from './iam-role.entity';

type QueryParams = {
  PolicyArn: string;
  RoleName: string;
}

@Injectable()
export class AttachRolePolicyHandler extends AbstractActionHandler<QueryParams> {

  constructor(
    @InjectRepository(IamRole)
    private readonly roleRepo: Repository<IamRole>,
    @InjectRepository(IamRolePolicyAttachment)
    private readonly attachRepo: Repository<IamRolePolicyAttachment>,
  ) {
    super();
  }

  format = Format.Xml;
  action = Action.IamAttachRolePolicy;
  validator = Joi.object<QueryParams, true>({ 
    PolicyArn: Joi.string().required(),
    RoleName: Joi.string().required(),
  });

  protected async handle({ PolicyArn, RoleName }: QueryParams, awsProperties: AwsProperties) {

    const role = await this.roleRepo.findOne({ where: { roleName: RoleName, accountId: awsProperties.accountId} });

    await this.attachRepo.create({
      id: uuid.v4(),
      policyArn: PolicyArn,
      roleId: role.id,
      accountId: awsProperties.accountId,
    }).save();
  }
}
