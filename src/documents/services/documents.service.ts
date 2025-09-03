import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../entities/document.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { DocumentTemplate } from '../entities/document-template.entity';
import { TransactionAuthorizationService } from '../../transactions/services/transaction-authorization.service';
import { User } from 'src/users/entities/user.entity';
import { StorageService } from './storage.service';
import { DocumentStatus } from '../../common/enums';
import { DocumentNotFoundException } from '../expections/document-not-found.exception';
import { InvalidStatusTransitionException } from '../expections/invalid-status-transition.exception';

@Injectable()
export class DocumentsService {
  private DEFAULT_DOCUMENT_STATUS = DocumentStatus.PENDING;
  private readonly allowedTransitions = new Map<
    DocumentStatus,
    Set<DocumentStatus>
  >([
    [
      DocumentStatus.PENDING,
      new Set([DocumentStatus.READY, DocumentStatus.REJECTED]),
    ],
    [
      DocumentStatus.READY,
      new Set([
        DocumentStatus.WAITING,
        DocumentStatus.SIGNED,
        DocumentStatus.PENDING,
        DocumentStatus.REJECTED,
      ]),
    ],
    [
      DocumentStatus.WAITING,
      new Set([
        DocumentStatus.SIGNED,
        DocumentStatus.PENDING,
        DocumentStatus.REJECTED,
      ]),
    ],
    [DocumentStatus.SIGNED, new Set([DocumentStatus.REJECTED])],
    [DocumentStatus.REJECTED, new Set([])],
  ]);
  private readonly logger = new Logger(DocumentsService.name);
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    private readonly transactionAuthorizationService: TransactionAuthorizationService,
    private readonly storageService: StorageService,
  ) {}

  async addDocumentToTransaction(
    user: User,
    transaction: Transaction,
    documentTemplate: DocumentTemplate,
    status: DocumentStatus = this.DEFAULT_DOCUMENT_STATUS,
  ): Promise<Document> {
    // First verify that the user has access to this transaction
    await this.transactionAuthorizationService.verifyUserCanAccessTransaction(
      transaction.transactionId,
      user.auth0Id,
    );
    const newFilePath = await this.storageService.duplicateFile(
      documentTemplate.filePath,
    );

    // If the user is authorized, proceed to add the document to the transaction
    const document = this.documentRepository.create({
      transaction,
      title: documentTemplate.title,
      category: documentTemplate.category,
      filePath: newFilePath,
      status,
    });
    return await this.documentRepository.save(document);
  }

  existsInTransaction(transaction: Transaction, savedDocument: Document) {
    return transaction.documents.some(
      (doc) => doc.documentId === savedDocument.documentId,
    );
  }

  async updateDocumentStatus(
    userId: string,
    transactionId: string,
    documentId: string,
    status: DocumentStatus,
  ): Promise<Document> {
    await this.transactionAuthorizationService.verifyUserCanAccessTransaction(
      transactionId,
      userId,
    );
    const document = await this.documentRepository.findOne({
      where: { documentId },
    });
    if (!document) {
      throw new DocumentNotFoundException(documentId);
    }

    const allowedTransitions = this.allowedTransitions.get(document.status);
    if (!allowedTransitions || !allowedTransitions.has(status)) {
      throw new InvalidStatusTransitionException(document.status, status);
    }

    // 3. Actualizar el estado del documento
    document.status = status;
    return await this.documentRepository.save(document);
  }

  async generateSecureUrl(
    documentId: string,
    userId: string,
    expirationHours = 1,
  ): Promise<string> {
    const document = await this.documentRepository.findOne({
      where: { documentId },
      relations: ['transaction'],
    });

    if (!document) {
      throw new DocumentNotFoundException(documentId);
    }

    // Verify user has access to this transaction
    await this.transactionAuthorizationService.verifyUserCanAccessTransaction(
      document.transaction.transactionId,
      userId,
    );

    if (!document.filePath) {
      throw new Error('Document has no associated file');
    }

    const secureUrl = this.storageService.generateSecureUrl(
      document.filePath,
      expirationHours,
    );

    this.logger.log(
      `Generated secure URL for document ${documentId}, expires in ${expirationHours} hour(s)`,
    );

    return secureUrl;
  }
}
