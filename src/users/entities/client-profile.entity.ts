import { ChildEntity, Column, OneToMany } from 'typeorm';
import { Profile } from './profile.entity';
import { ProfileType } from '../../common/enums/profile-type.enum';
import { Transaction } from '../../transactions/entities/transaction.entity';

@ChildEntity(ProfileType.CLIENT)
export class ClientProfile extends Profile {
  @Column({
    type: 'date',
    nullable: true,
  })
  dateOfBirth: Date;

  @OneToMany(() => Transaction, (transaction) => transaction.client)
  transactions: Transaction[];
}
