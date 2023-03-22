import { BaseEntity, Column, CreateDateColumn, Entity, Index, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('secret')
export class Secret extends BaseEntity {

  @PrimaryColumn({ name: 'versionId' })
  versionId: string;

  @Column({ name: 'name', nullable: false })
  @Index()
  name: string;

  @Column({ name: 'description', nullable: true })
  description: string;

  @Column({ name: 'secret_string', nullable: true })
  secretString: string;

  @Column({ name: 'account_id', nullable: false })
  accountId: string;

  @Column({ name: 'region', nullable: false })
  region: string;

  @CreateDateColumn()
  createdAt: string;

  get arn(): string {
    return `arn:aws:secretsmanager:${this.region}:${this.accountId}:${this.name}`;
  }

  static getNameFromSecretId(secretId: string) {
    const parts = secretId.split(':');
    return parts.length > 1 ? parts.pop() : secretId;
  }
}
