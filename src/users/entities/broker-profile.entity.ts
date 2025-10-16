import { ChildEntity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Profile, ProfileType } from './profile.entity';
import { Brokerage } from './brokerage.entity';

@ChildEntity(ProfileType.BROKER)
export class BrokerProfile extends Profile {
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    nullable: true,
  })
  licenseNumber: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'MLS number',
  })
  mlsNumber: string;

  @ManyToOne(() => Brokerage, (brokerage) => brokerage.brokers, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'brokerageId' })
  brokerage?: Brokerage;
}
