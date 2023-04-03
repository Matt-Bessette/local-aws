import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'kms_key'})
export class KmsKey extends BaseEntity {

  @PrimaryColumn()
  id: string;

  @Column({ name: 'usage' })
  usage: string;

  @Column({ name: 'description' })
  description: string;

  @Column({ name: 'key_spec' })
  keySpec: string;

  @Column({ name: 'key' })
  key: string;

  @Column({ name: 'account_id', nullable: false })
  accountId: string;

  @Column({ name: 'region', nullable: false })
  region: string;

  @CreateDateColumn()
  createdAt: string;

  get arn() {
    return `arn:aws:kms:${this.region}:${this.accountId}:key/${this.id}`;
  }
  
  get metadata() {
    return {
      AWSAccountId: this.accountId,
      KeyId: this.id,
      Arn: this.arn,
      CreationDate: new Date(this.createdAt).toISOString(),
      Enabled: true,
      Description: this.description,
      KeyUsage: this.usage,
      KeyState: 'Enabled',
      KeyManager: "CUSTOMER",
      CustomerMasterKeySpec: this.keySpec,
      KeySpec: this.keySpec,
      DeletionDate: null,
      SigningAlgorithms: [
        "RSASSA_PSS_SHA_256",
        "RSASSA_PSS_SHA_384",
        "RSASSA_PSS_SHA_512",
        "RSASSA_PKCS1_V1_5_SHA_256",
        "RSASSA_PKCS1_V1_5_SHA_384",
        "RSASSA_PKCS1_V1_5_SHA_512"
      ]
    }
  }
}
