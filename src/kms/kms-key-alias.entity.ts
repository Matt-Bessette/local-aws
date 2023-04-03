import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'kms_key_alias' })
export class KmsKeyAlias extends BaseEntity {

  @PrimaryColumn()
  name: string;

  @Column({ name: 'target_key_id' })
  targetKeyId: string;

  @Column({ name: 'account_id', nullable: false })
  accountId: string;

  @Column({ name: 'region', nullable: false })
  region: string;

  get arn() {
    return `arn:aws:kms:${this.region}:${this.accountId}:alias/${this.name}`;
  }
}
