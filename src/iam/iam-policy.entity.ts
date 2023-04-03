import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { IamRolePolicyAttachment } from './iam-role-policy-attachment.entity';
import { IamRole } from './iam-role.entity';

@Entity({ name: 'iam_policy' })
export class IamPolicy extends BaseEntity {

  @PrimaryColumn()
  id: string;

  @Column({ default: 1 })
  version: number;

  @Column({ name: 'is_default', default: true })
  isDefault: boolean;

  @Column()
  name: string;

  @Column()
  document: string;

  @Column({ name: 'account_id', nullable: false })
  accountId: string;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;

  @OneToOne(() => IamRole, role => role.assumeRolePolicyDocument)
  iamRole: IamRole;

  get arn() {
    return `arn:aws:iam::${this.accountId}:policy/${this.name}`;
  }
}
