import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  TableInheritance,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ProfileType } from '../../common/enums/profile-type.enum';

@Entity('profiles')
@TableInheritance({ column: { type: 'varchar', name: 'profile_type' } })
export abstract class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ProfileType,
  })
  profileType: ProfileType;

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Name used for electronic signatures',
  })
  esignName: string;

  @Column({
    type: 'varchar',
    length: 5,
    nullable: true,
    comment: 'Initials used for electronic signatures',
  })
  esignInitials: string;

  @Column({
    type: 'varchar',
    length: 15,
    nullable: false,
    comment: 'Phone number (US format)',
  })
  phoneNumber: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
