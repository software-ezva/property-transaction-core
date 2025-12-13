import { ChildEntity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Profile } from './profile.entity';
import { ProfileType } from '../../common/enums/profile-type.enum';
import { Brokerage } from './brokerage.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';

@ChildEntity(ProfileType.REAL_ESTATE_AGENT)
export class RealEstateAgentProfile extends Profile {
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

  @ManyToOne(() => Brokerage, (brokerage) => brokerage.realEstateAgents, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'brokerageId' })
  brokerage?: Brokerage;

  @OneToMany(() => Transaction, (transaction) => transaction.realEstateAgent)
  transactions: Transaction[];
}
