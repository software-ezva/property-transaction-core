import { ChildEntity, Column } from 'typeorm';
import { Profile, ProfileType } from './profile.entity';

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
}
