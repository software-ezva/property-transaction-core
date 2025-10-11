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
import { User } from '../../users/entities/user.entity';
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Property, (property) => property.transactions, {
    nullable: false,
  })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @ManyToOne(() => User, (user) => user.agentTransactions, {
    nullable: false,
  })
  @JoinColumn({ name: 'agentId' })
  agent: User;

  @ManyToOne(() => User, (user) => user.clientTransactions, {
    nullable: true,
  })
  @JoinColumn({ name: 'clientId' })
  client?: User;

  @OneToOne(() => Workflow, (workflow) => workflow.transaction, {
    cascade: ['insert', 'update', 'remove'],
    nullable: true,
    onDelete: 'CASCADE',
  })
  workflow: Workflow;

  @OneToMany(() => Document, (document) => document.transaction)
  documents: Document[];

  @ManyToMany(() => User, (user) => user.supportingProfessionalTransactions)
  @JoinTable()
  supportingProfessionals: User[];
}
