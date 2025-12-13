import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Property } from '../../properties/entities/property.entity';
import { TransactionCoordinatorAgentProfile } from '../../users/entities/transaction-coordinator-agent-profile.entity';
import { RealEstateAgentProfile } from '../../users/entities/real-estate-agent-profile.entity';
import { ClientProfile } from '../../users/entities/client-profile.entity';
import { SupportingProfessionalProfile } from '../../users/entities/supporting-professional-profile.entity';
import { Workflow } from './workflow.entity';
import { TransactionType, TransactionStatus } from '../../common/enums';
import { Document } from '../../documents/entities/document.entity';
@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  transactionId: string;
  @Column({
    type: 'enum',
    enum: TransactionType,
    nullable: true,
  })
  transactionType: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.IN_PREPARATION,
  })
  status: TransactionStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  additionalNotes?: string;

  @Column({ type: 'varchar', length: 6, unique: true, nullable: true })
  accessCode: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Property, (property) => property.transactions, {
    nullable: false,
  })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @ManyToOne(
    () => TransactionCoordinatorAgentProfile,
    (profile) => profile.transactions,
    {
      nullable: false,
    },
  )
  @JoinColumn({ name: 'transactionCoordinatorAgentId' })
  transactionCoordinatorAgent: TransactionCoordinatorAgentProfile;

  @ManyToOne(() => RealEstateAgentProfile, (profile) => profile.transactions, {
    nullable: true,
  })
  @JoinColumn({ name: 'realEstateAgentId' })
  realEstateAgent?: RealEstateAgentProfile;

  @ManyToOne(() => ClientProfile, (profile) => profile.transactions, {
    nullable: true,
  })
  @JoinColumn({ name: 'clientId' })
  client?: ClientProfile;

  @OneToOne(() => Workflow, (workflow) => workflow.transaction, {
    cascade: ['insert', 'update', 'remove'],
    nullable: true,
    onDelete: 'CASCADE',
  })
  workflow: Workflow;

  @OneToMany(() => Document, (document) => document.transaction)
  documents: Document[];

  @ManyToMany(
    () => SupportingProfessionalProfile,
    (profile) => profile.transactions,
  )
  @JoinTable()
  supportingProfessionals: SupportingProfessionalProfile[];
}
