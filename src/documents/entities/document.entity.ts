import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { DocumentCategory } from '../../common/enums';
import { DocumentStatus } from '../../common/enums/';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Signature } from './signatures.entity';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  documentId: string;

  @Column()
  title: string;

  @Column({
    type: 'enum',
    enum: DocumentCategory,
  })
  category: DocumentCategory;

  @Column()
  filePath: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Transaction, (transaction) => transaction.documents, {
    nullable: false,
  })
  transaction: Transaction;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
  })
  status: DocumentStatus;

  @OneToMany(() => Signature, (signature) => signature.document)
  signatures: Signature[];
}
