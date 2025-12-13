import { FindOptionsWhere } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { ProfileType } from '../../common/enums';

export const getTransactionWhereClauseByProfileType = (
  profileType: ProfileType,
  userId: string,
): FindOptionsWhere<Transaction> | null => {
  const whereClauseMap: Partial<
    Record<ProfileType, FindOptionsWhere<Transaction>>
  > = {
    [ProfileType.TRANSACTION_COORDINATOR_AGENT]: {
      transactionCoordinatorAgent: { user: { id: userId } },
    },
    [ProfileType.REAL_ESTATE_AGENT]: {
      realEstateAgent: { user: { id: userId } },
    },
    [ProfileType.CLIENT]: {
      client: { user: { id: userId } },
    },
    [ProfileType.SUPPORTING_PROFESSIONAL]: {
      supportingProfessionals: { user: { id: userId } },
    },
  };

  return whereClauseMap[profileType] || null;
};
