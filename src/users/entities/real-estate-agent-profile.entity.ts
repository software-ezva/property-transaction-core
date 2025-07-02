import { ChildEntity, Column } from 'typeorm';
import { Profile, ProfileType } from './profile.entity';

@ChildEntity(ProfileType.REAL_ESTATE_AGENT)
export class RealEstateAgentProfile extends Profile {
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    nullable: true,
  })
  licenseNumber: string;
}
