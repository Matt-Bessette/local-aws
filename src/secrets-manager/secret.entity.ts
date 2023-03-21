import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('secret')
export class Secret extends BaseEntity {

  @PrimaryGeneratedColumn({ name: 'id' })
  id: string;

}
