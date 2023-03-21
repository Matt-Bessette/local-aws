import { BaseEntity, Column, Entity, Index, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tags')
export class Tag extends BaseEntity {

  @PrimaryGeneratedColumn({ name: 'id' })
  id: string;

  @Column({ name: 'arn', nullable: false})
  @Index()
  arn: string;

  @Column({ name: 'name', nullable: false })
  name: string;

  @Column({ name: 'value', nullable: false })
  value: string;
}
