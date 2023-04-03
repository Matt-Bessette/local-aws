import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { IamPolicy } from './iam-policy.entity';

@Entity({ name: 'iam_role' })
export class IamRole extends BaseEntity {

  @PrimaryColumn()
  id: string

  @Column({ name: 'role_name' })
  roleName: string;

  @Column()
  path: string;

  @Column({ name: 'assume_role_policy_document_id', nullable: false })
  assumeRolePolicyDocumentId: string;

  @Column({ name: 'account_id', nullable: false })
  accountId: string;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;

  @OneToOne(() => IamPolicy, (policy) => policy.id, { eager: true })
  @JoinColumn({ name: 'assume_role_policy_document_id' })
  assumeRolePolicyDocument: IamPolicy;

  get arn() {
    const identifier = this.path.split('/');
    identifier.push(this.roleName);
    return `arn:aws:iam::${this.accountId}:role/${identifier.join('/')}`;
  }

  get metadata() {
    return {
      Path: this.path,
      Arn: this.arn,
      RoleName: this.roleName,
      AssumeRolePolicyDocument: this.assumeRolePolicyDocument.document,
      CreateDate: new Date(this.createdAt).toISOString(),
      RoleId: this.id,
    }
  }
}
