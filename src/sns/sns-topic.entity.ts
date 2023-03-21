import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('sns_topic')
export class SnsTopic extends BaseEntity {

  @PrimaryColumn({ name: 'name' })
  name: string;

  @Column({ name: 'account_id', nullable: false })
  accountId: string;

  @Column({ name: 'region', nullable: false })
  region: string;

  get topicArn(): string {
    return `arn:aws:sns:${this.region}:${this.accountId}:${this.name}`;
  }
}
