import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Signature } from '../entities/signatures.entity';
import { Document } from '../entities/document.entity';
import { User } from '../../users/entities/user.entity';
import { UserCannotSignDocumentException } from '../expections/user-cannot-sign-document.exception';
import { DocumentAlreadySignedException } from '../expections/document-already-signed.exception';
import { SignatureAlreadyRequestedException } from '../expections/signature-already-requested.exception';
import { RequestSignDto } from '../dto/request-sign.dto';

@Injectable()
export class SignatureService {
  private readonly logger = new Logger(SignatureService.name);

  constructor(
    @InjectRepository(Signature)
    private signatureRepository: Repository<Signature>,
  ) {}

  canUserSignDocument(document: Document, auth0Id: string): boolean {
    const signature = document.signatures.find(
      (s) => s.signer?.auth0Id === auth0Id,
    );

    if (!signature) {
      throw new UserCannotSignDocumentException(auth0Id, document.documentId);
    }

    if (signature.isSigned) {
      throw new DocumentAlreadySignedException(auth0Id, document.documentId);
    }

    return true;
  }

  async markSignatureAsCompleted(
    document: Document,
    auth0Id: string,
  ): Promise<void> {
    const signature = document.signatures.find(
      (s) => s.signer?.auth0Id === auth0Id,
    )!;
    signature.isSigned = true;
    signature.signedAt = new Date();
    await this.signatureRepository.save(signature);

    this.logger.log(
      `Signature completed for document ${document.documentId} by user ${auth0Id}`,
    );
  }

  areAllSignaturesCompleted(document: Document): boolean {
    return document.signatures.every((sig) => sig.isSigned);
  }

  async createSignatureRequest(
    document: Document,
    signatureData: RequestSignDto,
  ): Promise<Signature> {
    const existingSignature = await this.signatureRepository.findOne({
      where: {
        document: { documentId: document.documentId },
        signer: { id: signatureData.userId },
      },
    });

    if (existingSignature) {
      throw new SignatureAlreadyRequestedException(
        signatureData.userId,
        document.documentId,
      );
    }

    const signature = this.signatureRepository.create({
      document: document,
      signer: { id: signatureData.userId } as User,
      isSigned: false,
    });

    const savedSignature = await this.signatureRepository.save(signature);

    // Load the signature with signer relation for returning
    const signatureWithSigner = await this.signatureRepository.findOne({
      where: { signatureId: savedSignature.signatureId },
      relations: ['signer'],
    });

    this.logger.log(
      `Signature requested for document ${document.documentId} from user ${signatureData.userId}`,
    );

    return signatureWithSigner!;
  }

  async getSignaturesForDocument(documentId: string): Promise<Signature[]> {
    return await this.signatureRepository.find({
      where: { document: { documentId } },
      order: { signedAt: 'ASC' },
    });
  }

  async hasUserSignedDocument(
    documentId: string,
    auth0Id: string,
  ): Promise<boolean> {
    const signature = await this.signatureRepository.findOne({
      where: {
        document: { documentId },
        signer: { auth0Id },
        isSigned: true,
      },
    });

    return !!signature;
  }

  async markSignatureAsRejected(
    document: Document,
    auth0Id: string,
    reason: string,
  ): Promise<void> {
    const signature = document.signatures.find(
      (s) => s.signer?.auth0Id === auth0Id,
    )!;
    signature.isSigned = false;
    signature.rejectionReason = reason;
    await this.signatureRepository.save(signature);
    this.logger.log(
      `Signature rejected for document ${document.documentId} by user ${auth0Id} for reason: ${reason}`,
    );
  }
}
