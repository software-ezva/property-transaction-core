import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/services/users.service';
import {
  TransactionNotFoundException,
  UnauthorizedTransactionAccessException,
} from '../expections';
import { UserNotFoundException } from '../../users/exceptions';

@Injectable()
export class TransactionAuthorizationService {
  private readonly logger = new Logger(TransactionAuthorizationService.name);

  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private readonly usersService: UsersService,
  ) {}

  async verifyUserCanAccessTransaction(
    transactionId: string,
    userAuth0Id: string,
  ): Promise<{ transaction: Transaction; user: User }> {
    // Get user from auth0 ID
    const user = await this.usersService.getUserByAuth0Id(userAuth0Id);
    if (!user) {
      this.logger.warn(`User with Auth0 ID ${userAuth0Id} not found`);
      throw new UserNotFoundException(userAuth0Id);
    }

    // Get transaction with related users
    const transaction = await this.transactionRepository.findOne({
      where: { transactionId },
      relations: ['agent', 'client'],
    });

    if (!transaction) {
      this.logger.warn(`Transaction with ID ${transactionId} not found`);
      throw new TransactionNotFoundException(transactionId);
    }

    // Check if user is the agent or client of this transaction
    const isAgent = transaction.agent?.id === user.id;
    const isClient = transaction.client?.id === user.id;

    if (!isAgent && !isClient) {
      this.logger.warn(
        `User ${userAuth0Id} (ID: ${user.id}) does not have access to transaction ${transactionId}`,
      );
      throw new UnauthorizedTransactionAccessException(
        userAuth0Id,
        transactionId,
      );
    }

    this.logger.log(
      `User ${userAuth0Id} verified access to transaction ${transactionId} as ${
        isAgent ? 'agent' : 'client'
      }`,
    );

    return { transaction, user };
  }
}
