import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  TableInheritance,
} from 'typeorm';
import { User } from './user.entity';

export enum ProfileType {
  CLIENT = 'client',
  REAL_ESTATE_AGENT = 'real_estate_agent',
}

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

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
