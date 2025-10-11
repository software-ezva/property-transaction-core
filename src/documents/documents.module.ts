import { Module } from '@nestjs/common';
import { DocumentsService } from './services/documents.service';
import { SignatureService } from './services/signature.service';
import { DocumentsController } from './controllers/documents.controller';
import { DocumentTemplatesController } from './controllers/document-templates.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './entities/document.entity';
import { Signature } from './entities/signatures.entity';
import { User } from '../users/entities/user.entity';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { StorageService } from './services/storage.service';
import { FirebaseService } from './services/firebase.service';
import { DocumentTemplatesService } from './services/document-templates.service';
import { DocumentTemplate } from './entities/document-template.entity';
import { UsersModule } from 'src/users/users.module';
import { StatusManager } from './states/document-state-manager';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, DocumentTemplate, Signature, User]),
    TransactionsModule,
    UsersModule,
  ],
  controllers: [DocumentsController, DocumentTemplatesController],
  providers: [
    DocumentsService,
    SignatureService,
    StorageService,
    FirebaseService,
    DocumentTemplatesService,
    StatusManager,
  ],
  exports: [
    DocumentsService,
    SignatureService,
    DocumentTemplatesService,
    StorageService,
    FirebaseService,
    StatusManager,
  ],
})
export class DocumentsModule {}
