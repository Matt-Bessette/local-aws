import { BaseEntity, Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sns_topic_subscription')
export class SnsTopicSubscription extends BaseEntity {

  @PrimaryColumn({ name: 'id' })
  id: string;

  @Column({ name: 'topic_arn' })
  topicArn: string;

  @Column({ name: 'endpoint', nullable: true })
  endpoint: string;

  @Column({ name: 'protocol' })
  protocol: string;

  @Column({ name: 'account_id', nullable: false })
  accountId: string;

  @Column({ name: 'region', nullable: false })
  region: string;

  get arn() {
    return `${this.topicArn}:${this.id}`;
  }
}
