import { Transaction } from '../entities/transaction.entity';

export interface TransactionWithSummaryInfo {
  transaction: Transaction;
  propertyAddress: string;
  propertyValue: number;
  clientName: string | null;
  totalWorkflowItems: number;
  completedWorkflowItems: number;
  nextIncompleteItemDate: Date | null;
}
