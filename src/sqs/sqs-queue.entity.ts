import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('sqs_queue')
export class SqsQueue extends BaseEntity {

  @PrimaryColumn({ name: 'name' })
  name: string;

  @Column({ name: 'account_id', nullable: false })
  accountId: string;

  @Column({ name: 'region', nullable: false })
  region: string;

  get arn(): string {
    return `arn:aws:sns:${this.region}:${this.accountId}:${this.name}`;
  }

  getUrl(host: string): string {
    return `${host}/${this.accountId}/${this.name}`;
  }

  static getAccountIdAndNameFromPath(path: string): [string, string] {
    const [_, accountId, name] = path.split('/');
    return [accountId, name];
  }

  static getAccountIdAndNameFromArn(arn: string): [string, string] {
    const parts = arn.split(':');
    const name = parts.pop();
    const accountId = parts.pop();
    return [accountId, name];
  }

  static tryGetAccountIdAndNameFromPathOrArn(pathOrArn: string): [string, string] {
    if (pathOrArn.split(':').length) {
      return SqsQueue.getAccountIdAndNameFromArn(pathOrArn);
    }
    return SqsQueue.getAccountIdAndNameFromPath(pathOrArn);
  }
}
