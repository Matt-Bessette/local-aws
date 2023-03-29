import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { getPathFromUrl } from '../util/get-path-from-url';

const attributeSlotMap = {
  'Name': 'key',
  'Value': 'value',
}

@Entity('sqs_queue')
export class SqsQueue extends BaseEntity {

  @PrimaryColumn({ name: 'name' })
  name: string;

  @Column({ name: 'account_id', nullable: false })
  accountId: string;

  @Column({ name: 'region', nullable: false })
  region: string;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;

  get arn(): string {
    return `arn:aws:sqs:${this.region}:${this.accountId}:${this.name}`;
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
    const workingString = getPathFromUrl(pathOrArn);
    if (workingString.split(':').length > 1) {
      return SqsQueue.getAccountIdAndNameFromArn(workingString);
    }
    return SqsQueue.getAccountIdAndNameFromPath(workingString);
  }

  static attributePairs(queryParams: Record<string, string>): { key: string, value: string }[] {
    const pairs = [null];
    for (const param of Object.keys(queryParams)) {
      const [type, idx, slot] = param.split('.');
      if (type === 'Attribute') {
        if (!pairs[+idx]) {
          pairs[+idx] = { key: '', value: ''};
        }
        pairs[+idx][attributeSlotMap[slot]] = queryParams[param];
      }
    }

    pairs.shift();
    return pairs;
  }
}
