import { Transaction } from '../entities/transaction.entity';

export interface TransactionWithDetailedInfo {
  transaction: Transaction;
  propertyAddress: string | null;
  propertyPrice: number | null;
  propertySize: number | null;
  propertyBedrooms: number | null;
  propertyBathrooms: number | null;
  clientName: string | null;
  clientEmail: string | null;
  totalWorkflowItems: number;
  completedWorkflowItems: number;
  nextIncompleteItemDate: Date | null;
}
