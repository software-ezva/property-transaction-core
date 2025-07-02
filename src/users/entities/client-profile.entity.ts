import { ChildEntity, Column } from 'typeorm';
import { Profile, ProfileType } from './profile.entity';

@ChildEntity(ProfileType.CLIENT)
export class ClientProfile extends Profile {
  @Column({
    type: 'date',
    nullable: true,
  })
  dateOfBirth: Date;
}
