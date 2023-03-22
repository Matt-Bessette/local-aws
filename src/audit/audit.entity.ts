import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('audit')
export class Audit extends BaseEntity {

  @PrimaryColumn()
  id: string;

  @CreateDateColumn()
  createdAt: string;

  @Column({ nullable: true })
  action: string;

  @Column({ nullable: true })
  request: string;

  @Column({ nullable: true })
  response: string;
}
