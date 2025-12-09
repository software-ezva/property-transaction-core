import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../entities/document.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { TransactionAuthorizationService } from '../../transactions/services/transaction-authorization.service';
import { StorageService } from './storage.service';
import { SignatureService } from './signature.service';
import { DocumentStatus } from '../../common/enums';
import { DocumentNotFoundException } from '../expections/document-not-found.exception';
import { DocumentNotEditableException } from '../expections/document-not-editable.exception';
import { DocumentNotReadyForSignaturesException } from '../expections/document-not-ready-for-signatures.exception';
import { UserNotInTransactionException } from '../expections/user-not-in-transaction.exception';
import { DocumentTemplatesService } from './document-templates.service';
import { StatusManager } from '../states/document-state-manager';
import { UsersService } from '../../users/services/users.service';
import { DocumentFile } from '../interfaces/document-file.interface';
import { RequestSignDto } from '../dto/request-sign.dto';

@Injectable()
export class DocumentsService {
  private DEFAULT_DOCUMENT_STATUS = DocumentStatus.PENDING;
  private ENABLED_STATUS_FOR_SIGNATURE_REQUESTS =
    DocumentStatus.AWAITING_SIGNATURES;
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    private readonly documentTemplatesService: DocumentTemplatesService,
    private readonly transactionAuthorizationService: TransactionAuthorizationService,
    private readonly storageService: StorageService,
    private readonly signatureService: SignatureService,
    private readonly statusManager: StatusManager,
    private readonly userService: UsersService,
  ) {}

  async findAllByTransactionId(
    transactionId: string,
    auth0Id: string,
  ): Promise<Document[]> {
    // First verify that the user has access to this transaction
    await this.transactionAuthorizationService.verifyUserCanAccessTransaction(
      transactionId,
      auth0Id,
    );

    const documents = await this.documentRepository.find({
      where: { transaction: { transactionId } },
      order: { createdAt: 'DESC' },
    });

    this.logger.log(
      `Retrieved ${documents.length} documents for transaction ${transactionId} by user ${auth0Id}`,
    );
    return documents;
  }

  async findOneByTransactionId(
    transactionId: string,
    documentId: string,
    userId: string,
  ): Promise<{
    document: Document;
    secureUrl: string;
    isEditable: boolean;
    isSignable: boolean;
    couldBeRequestedForSignature: boolean;
  }> {
    const document = await this.getDocument(transactionId, userId, documentId);
    // Generate secure URL for accessing the document file
    const secureUrl = await this.storageService.generateSecureUrl(
      document.filePath,
      1,
    );
    const state = this.statusManager.getStateFor(document.status);
    const isEditable = state.isEditable();
    const isSignable = state.isSignable();
    const couldBeRequestedForSignature =
      this.couldBeRequestedForSignatures(document);

    this.logger.log(
      `Document ${documentId} retrieved successfully from transaction ${transactionId} by user ${userId}`,
    );

    return {
      document,
      secureUrl,
      isEditable,
      isSignable,
      couldBeRequestedForSignature,
    };
  }

  private async findDocumentWithSignatures(
    documentId: string,
  ): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { documentId },
      relations: ['signatures', 'signatures.signer'],
    });

    if (!document) {
      throw new DocumentNotFoundException(documentId);
    }

    return document;
  }

  private async getDocument(
    transactionId: string,
    auth0Id: string,
    documentId: string,
  ) {
    await this.transactionAuthorizationService.verifyUserCanAccessTransaction(
      transactionId,
      auth0Id,
    );
    const document = await this.findDocumentWithSignatures(documentId);
    return document;
  }

  async addDocumentToTransaction(
    auth0Id: string,
    transactionId: string,
    documentTemplateId: string,
    status: DocumentStatus = this.DEFAULT_DOCUMENT_STATUS,
  ): Promise<Document> {
    await this.transactionAuthorizationService.verifyUserCanAccessTransaction(
      transactionId,
      auth0Id,
    );
    await this.userService.verifyUserIsTransactionCoordinatorAgent(auth0Id);

    const documentTemplate =
      await this.documentTemplatesService.getDocumentTemplate(
        documentTemplateId,
      );

    const newFilePath = await this.storageService.storageTransactionDocument(
      documentTemplate.filePath,
      documentTemplate.title,
      transactionId,
    );

    // If the user is authorized, proceed to add the document to the transaction
    const document = this.documentRepository.create({
      transaction: { transactionId },
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

  async edit(
    transactionId: string,
    documentId: string,
    auth0Id: string,
    file: DocumentFile,
    isReadyForSigning: boolean = false,
  ): Promise<{
    document: Document;
    secureUrl: string;
    isEditable: boolean;
    isSignable: boolean;
    couldBeRequestedForSignature: boolean;
  }> {
    const document = await this.getDocument(transactionId, auth0Id, documentId);

    // Validate that the document can be edited based on its current state
    const state = this.statusManager.getStateFor(document.status);
    if (!state.isEditable()) {
      throw new DocumentNotEditableException(
        document.documentId,
        document.status,
      );
    }

    // Update file in storage
    await this.storageService.replaceDocument(file, document.filePath);

    if (isReadyForSigning) {
      const oldStatus = document.status;
      const newStatus = state.readyForSigning(document); // State modifica y retorna

      this.logger.log(
        `Document ${documentId} edited and marked as ready for signing. Status changed from ${oldStatus} to ${newStatus} in transaction ${transactionId} by user ${auth0Id}`,
      );
    } else {
      this.logger.log(
        `Document file ${documentId} updated successfully in transaction ${transactionId} by user ${auth0Id}`,
      );
    }

    const updatedDocument = await this.documentRepository.save(document);

    // Generate secure URL and calculate states after the update
    const secureUrl = await this.storageService.generateSecureUrl(
      updatedDocument.filePath,
      1,
    );
    const updatedState = this.statusManager.getStateFor(updatedDocument.status);
    const isEditable = updatedState.isEditable();
    const isSignable = updatedState.isSignable();
    const couldBeRequestedForSignature =
      this.couldBeRequestedForSignatures(updatedDocument);

    return {
      document: updatedDocument,
      secureUrl,
      isEditable,
      isSignable,
      couldBeRequestedForSignature,
    };
  }

  async checkDocumentForEdit(
    auth0Id: string,
    documentId: string,
    transactionId: string,
  ): Promise<{
    document: Document;
    isEditable: boolean;
    isSignable: boolean;
    couldBeRequestedForSignature: boolean;
  }> {
    await this.userService.verifyUserIsTransactionCoordinatorAgent(auth0Id);
    const document = await this.getDocument(transactionId, auth0Id, documentId);
    const state = this.statusManager.getStateFor(document.status);
    state.checkForEdit(document); // State modifica el documento directamente
    await this.documentRepository.save(document);

    // Calculate states after the update
    const updatedState = this.statusManager.getStateFor(document.status);
    const isEditable = updatedState.isEditable();
    const isSignable = updatedState.isSignable();
    const couldBeRequestedForSignature =
      this.couldBeRequestedForSignatures(document);

    return {
      document,
      isEditable,
      isSignable,
      couldBeRequestedForSignature,
    };
  }

  isDocumentEditable(document: Document): boolean {
    const state = this.statusManager.getStateFor(document.status);
    return state.isEditable();
  }

  isDocumentSignable(document: Document): boolean {
    const state = this.statusManager.getStateFor(document.status);
    return state.isSignable();
  }

  async correctDocument(
    auth0Id: string,
    transactionId: string,
    documentId: string,
  ): Promise<Document> {
    await this.userService.verifyUserIsTransactionCoordinatorAgent(auth0Id);
    const document = await this.getDocument(transactionId, auth0Id, documentId);

    const state = this.statusManager.getStateFor(document.status);
    const oldStatus = document.status;
    const newStatus = state.correctDocument(document);
    await this.documentRepository.save(document);

    this.logger.log(
      `Document ${documentId} corrected. Status changed from ${oldStatus} to ${newStatus} in transaction ${transactionId} by user ${auth0Id}`,
    );

    return document;
  }

  async signDocument(
    documentId: string,
    signerId: string,
    file: DocumentFile,
  ): Promise<Document> {
    const document = await this.findDocumentWithSignatures(documentId);

    this.signatureService.canUserSignDocument(document, signerId);

    await this.storageService.replaceDocument(file, document.filePath);

    await this.signatureService.markSignatureAsCompleted(document, signerId);
    const allSignaturesComplete =
      this.signatureService.areAllSignaturesCompleted(document);

    const state = this.statusManager.getStateFor(document.status);
    const newStatus = state.sign(document, allSignaturesComplete); // State modifica y retorna

    await this.documentRepository.save(document);

    this.logger.log(
      `Document ${documentId} signed by user ${signerId}. New status: ${newStatus}`,
    );

    return document;
  }

  async rejectDocument(
    documentId: string,
    signerId: string,
    reason: string,
  ): Promise<Document> {
    const document = await this.findDocumentWithSignatures(documentId);

    this.signatureService.canUserSignDocument(document, signerId);

    const state = this.statusManager.getStateFor(document.status);
    state.reject(document);
    await this.signatureService.markSignatureAsRejected(
      document,
      signerId,
      reason,
    );

    return this.documentRepository.save(document);
  }

  async requestSign(
    agentId: string,
    transactionId: string,
    documentId: string,
    signatureData: RequestSignDto,
  ): Promise<Document> {
    await this.userService.verifyUserIsTransactionCoordinatorAgent(agentId);

    const document = await this.getDocument(transactionId, agentId, documentId);

    if (!this.couldBeRequestedForSignatures(document)) {
      throw new DocumentNotReadyForSignaturesException(
        document.documentId,
        document.status,
      );
    }

    const userBelongs =
      await this.transactionAuthorizationService.userBelongsToTransaction(
        transactionId,
        signatureData.userId,
      );

    if (!userBelongs) {
      throw new UserNotInTransactionException(
        signatureData.userId,
        transactionId,
      );
    }

    const newSignature = await this.signatureService.createSignatureRequest(
      document,
      signatureData,
    );

    if (!document.signatures) {
      document.signatures = [];
    }
    document.signatures.push(newSignature);
    await this.documentRepository.save(document);

    this.logger.log(
      `Signature requested for document ${documentId} from user ${signatureData.userId} by agent ${agentId}`,
    );

    return document;
  }

  private couldBeRequestedForSignatures(document: Document): boolean {
    return document.status === this.ENABLED_STATUS_FOR_SIGNATURE_REQUESTS
      ? true
      : false;
  }

  async archiveDocument(
    auth0Id: string,
    transactionId: string,
    documentId: string,
  ): Promise<Document> {
    await this.userService.verifyUserIsTransactionCoordinatorAgent(auth0Id);
    const document = await this.getDocument(transactionId, auth0Id, documentId);
    const state = this.statusManager.getStateFor(document.status);
    state.archive(document);
    await this.documentRepository.save(document);
    this.logger.log(
      `Document ${documentId} archived in transaction ${transactionId} by user ${auth0Id}`,
    );

    return document;
  }
}
