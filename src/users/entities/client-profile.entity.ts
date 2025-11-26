import { ChildEntity, Column } from 'typeorm';
import { Profile } from './profile.entity';
import { ProfileType } from '../../common/enums/profile-type.enum';

@ChildEntity(ProfileType.CLIENT)
export class ClientProfile extends Profile {
  @Column({
    type: 'date',
    nullable: true,
  })
  dateOfBirth: Date;
}
