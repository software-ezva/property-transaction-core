import { ChildEntity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Profile, ProfileType } from './profile.entity';
import { Brokerage } from './brokerage.entity';

@ChildEntity(ProfileType.TRANSACTION_COORDINATOR_AGENT)
export class TransactionCoordinatorAgentProfile extends Profile {
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

  @ManyToOne(() => Brokerage, (brokerage) => brokerage.agents, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'brokerageId' })
  brokerage?: Brokerage;
}
