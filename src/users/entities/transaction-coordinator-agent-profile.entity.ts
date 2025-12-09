import { ChildEntity, Column, OneToMany } from 'typeorm';
import { Profile } from './profile.entity';
import { ProfileType } from '../../common/enums/profile-type.enum';
import { Transaction } from '../../transactions/entities/transaction.entity';

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

  @OneToMany(
    () => Transaction,
    (transaction) => transaction.transactionCoordinatorAgent,
  )
  transactions: Transaction[];
}
