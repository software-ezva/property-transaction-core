import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Document } from './document.entity';
import { User } from '../../users/entities/user.entity';

@Entity('signatures')
export class Signature {
  @PrimaryGeneratedColumn('uuid')
  signatureId: string;

  @ManyToOne(() => Document, (document) => document.signatures, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'documentId' })
  document: Document;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'signerId' })
  signer: User;

  @Column({ default: false })
  isSigned: boolean;

  @Column({ nullable: true })
  signedAt: Date;

  @Column({ nullable: true })
  rejectionReason: string;
}
