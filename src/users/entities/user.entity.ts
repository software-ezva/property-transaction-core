import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  ManyToMany,
  Index,
} from 'typeorm';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Profile, ProfileType } from './profile.entity';

@Entity('users')
@Index(['email'])
@Index(['auth0Id'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    comment: 'Auth0 User ID',
  })
  auth0Id: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    comment: 'User email address',
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  firstName: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  lastName: string;

  @Column({
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @OneToOne(() => Profile, (profile) => profile.user, {
    cascade: true,
    nullable: true,
  })
  profile: Profile;

  @OneToMany(() => Transaction, (transaction) => transaction.agent)
  agentTransactions: Transaction[];

  @OneToMany(() => Transaction, (transaction) => transaction.client)
  clientTransactions: Transaction[];

  @ManyToMany(
    () => Transaction,
    (transaction) => transaction.supportingProfessionals,
  )
  supportingProfessionalTransactions: Transaction[];

  get fullName(): string {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }

  getProfileInstance(): Profile | null {
    return this.profile || null;
  }

  isRealEstateAgent(): boolean {
    return this.profile?.profileType === ProfileType.REAL_ESTATE_AGENT;
  }

  isClient(): boolean {
    return this.profile?.profileType === ProfileType.CLIENT;
  }

  isSupportingProfessional(): boolean {
    return this.profile?.profileType === ProfileType.SUPPORTING_PROFESSIONAL;
  }

  toString(): string {
    return this.fullName || this.email;
  }
}
