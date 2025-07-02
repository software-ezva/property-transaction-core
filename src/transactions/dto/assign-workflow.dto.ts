import { TransactionType } from '../../common/enums';

export class AssignWorkflowDto {
  /**
   * The type of transaction that determines which workflow template to use
   * @example "PURCHASE"
   */
  transactionType: TransactionType;
}
