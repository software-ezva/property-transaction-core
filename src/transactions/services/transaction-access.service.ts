import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { UsersService } from '../../users/services/users.service';
import { AccessCodeGenerator } from '../../users/utils/access-code.generator';
import {
  TransactionWithAccessCodeNotFoundException,
  TransactionCoordinatorCannotJoinException,
  TransactionClientAlreadyAssignedException,
  TransactionRealEstateAgentAlreadyAssignedException,
  SupportingProfessionalAlreadyAssignedToTransactionException,
  UserRoleNotAuthorizedToJoinTransactionException,
} from '../exceptions';
import { InvalidAccessCodeFormatException } from '../../users/exceptions/invalid-access-code-format.exception';
import { ClientProfile } from '../../users/entities/client-profile.entity';
import { RealEstateAgentProfile } from '../../users/entities/real-estate-agent-profile.entity';
import { SupportingProfessionalProfile } from '../../users/entities/supporting-professional-profile.entity';

@Injectable()
export class TransactionAccessService {
  private readonly logger = new Logger(TransactionAccessService.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly usersService: UsersService,
  ) {}

  async joinTransactionWithCode(
    auth0Id: string,
    accessCode: string,
  ): Promise<Transaction> {
    // 1. Validate format
    if (!AccessCodeGenerator.isValid(accessCode)) {
      throw new InvalidAccessCodeFormatException(accessCode);
    }

    // 2. Find Transaction
    const transaction = await this.getTransactionPeopleByAccessCode(accessCode);

    // 3. Get User
    const user = await this.usersService.getUserByAuth0Id(auth0Id);

    // 4. Check Role and Assign
    if (user.isTransactionCoordinatorAgent()) {
      throw new TransactionCoordinatorCannotJoinException();
    }

    if (user.isClient()) {
      if (transaction.client) {
        throw new TransactionClientAlreadyAssignedException();
      }
      transaction.client = user.profile as ClientProfile;
    } else if (user.isRealEstateAgent()) {
      if (transaction.realEstateAgent) {
        throw new TransactionRealEstateAgentAlreadyAssignedException();
      }
      transaction.realEstateAgent = user.profile as RealEstateAgentProfile;
    } else if (user.isSupportingProfessional()) {
      const professional = user.profile as SupportingProfessionalProfile;
      const alreadyExists = transaction.supportingProfessionals.some(
        (p) => p.id === professional.id,
      );
      if (alreadyExists) {
        throw new SupportingProfessionalAlreadyAssignedToTransactionException();
      }
      transaction.supportingProfessionals.push(professional);
    } else {
      throw new UserRoleNotAuthorizedToJoinTransactionException();
    }

    const updatedTransaction =
      await this.transactionRepository.save(transaction);
    this.logger.log(
      `User ${user.id} joined transaction ${transaction.transactionId} via access code.`,
    );
    return updatedTransaction;
  }

  async getTransactionPeopleByAccessCode(
    accessCode: string,
  ): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { accessCode },
      relations: ['client', 'realEstateAgent', 'supportingProfessionals'],
    });

    if (!transaction) {
      throw new TransactionWithAccessCodeNotFoundException(accessCode);
    }
    return transaction;
  }

  async regenerateAccessCode(transactionId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { transactionId },
    });
    if (!transaction) {
      throw new NotFoundException(
        `Transaction with ID ${transactionId} not found`,
      );
    }

    transaction.accessCode = await this.getUniqueAccessCode();
    const updated = await this.transactionRepository.save(transaction);
    this.logger.log(
      `Regenerated access code for transaction ${transactionId}: ${updated.accessCode}`,
    );
    return updated;
  }

  async getUniqueAccessCode(): Promise<string> {
    let accessCode = AccessCodeGenerator.generate();
    let isUnique = false;

    while (!isUnique) {
      const existing = await this.transactionRepository.findOne({
        where: { accessCode },
      });

      if (!existing) {
        isUnique = true;
      } else {
        accessCode = AccessCodeGenerator.generate();
      }
    }

    return accessCode;
  }
}
