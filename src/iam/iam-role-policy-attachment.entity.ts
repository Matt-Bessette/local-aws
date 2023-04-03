import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { IamPolicy } from './iam-policy.entity';

@Entity({ name: 'iam_role_policy_attachment' })
export class IamRolePolicyAttachment extends BaseEntity {
  
  @PrimaryColumn()
  id: string;

  @Column({ name: 'policy_arn' })
  policyArn: string;

  @Column({ name: 'role_name' })
  roleId: string;

  @Column({ name: 'account_id'})
  accountId: string;
}
