import { Module } from '@nestjs/common';
import { DocumentsService } from './services/documents.service';
import { DocumentsController } from './controllers/documents.controller';
import { DocumentTemplatesController } from './controllers/document-templates.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './entities/document.entity';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { StorageService } from './services/storage.service';
import { DocumentTemplatesService } from './services/document-templates.service';
import { DocumentTemplate } from './entities/document-template.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, DocumentTemplate]),
    TransactionsModule,
    UsersModule,
  ],
  controllers: [DocumentsController, DocumentTemplatesController],
  providers: [DocumentsService, StorageService, DocumentTemplatesService],
  exports: [DocumentsService, DocumentTemplatesService, StorageService],
})
export class DocumentsModule {}
