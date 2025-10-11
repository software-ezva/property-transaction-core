import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DocumentCategory } from '../../common/enums';
@Entity('document_templates')
export class DocumentTemplate {
  @PrimaryGeneratedColumn('uuid')
  documentTemplateId: string;

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
}
