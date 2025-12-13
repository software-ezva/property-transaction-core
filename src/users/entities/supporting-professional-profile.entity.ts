import { ChildEntity, Column, ManyToMany, JoinTable } from 'typeorm';
import { Profile } from './profile.entity';
import { ProfileType } from '../../common/enums/profile-type.enum';
import { ProfessionalType } from '../../common/enums';
import { Brokerage } from './brokerage.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';

@ChildEntity(ProfileType.SUPPORTING_PROFESSIONAL)
export class SupportingProfessionalProfile extends Profile {
  @Column({
    type: 'enum',
    enum: ProfessionalType,
    nullable: false,
    comment: 'Type of supporting professional (Attorney, Appraiser, Other)',
  })
  professionalOf: ProfessionalType;

  @ManyToMany(
    () => Brokerage,
    (brokerage) => brokerage.supportingProfessionals,
    {
      cascade: false,
    },
  )
  @JoinTable({
    name: 'brokerage_supporting_professionals',
    joinColumn: {
      name: 'supporting_professional_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'brokerage_id',
      referencedColumnName: 'id',
    },
  })
  brokerages: Brokerage[];

  @ManyToMany(
    () => Transaction,
    (transaction) => transaction.supportingProfessionals,
  )
  transactions: Transaction[];
}
