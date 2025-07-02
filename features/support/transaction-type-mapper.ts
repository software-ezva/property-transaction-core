import { TransactionType } from '../../src/common/enums/transaction-type.enum';

/**
 * Helper function to map scenario strings to TransactionType enum values.
 * This is useful for Cucumber tests where scenario strings need to be converted
 * to the corresponding enum values used in the application.
 */
export function mapToTransactionType(scenarioString: string): TransactionType {
  const mappings: Record<string, TransactionType> = {
    'Listing for sale': TransactionType.LISTING_FOR_SALE,
    'Listing for Sale': TransactionType.LISTING_FOR_SALE,
    Purchase: TransactionType.PURCHASE,
    'Listing for lease': TransactionType.LISTING_FOR_LEASE,
    'Listing for Lease': TransactionType.LISTING_FOR_LEASE,
    Lease: TransactionType.LEASE,
    Other: TransactionType.OTHER,
  };

  const transactionType = mappings[scenarioString];
  if (!transactionType) {
    const availableTypes = Object.keys(mappings).join(', ');
    throw new Error(
      `Unknown transaction type: "${scenarioString}". Available types: ${availableTypes}`,
    );
  }

  return transactionType;
}

/**
 * Get all available transaction type mappings for testing purposes
 */
export function getAvailableTransactionTypeMappings(): Record<
  string,
  TransactionType
> {
  return {
    'Listing for sale': TransactionType.LISTING_FOR_SALE,
    'Listing for Sale': TransactionType.LISTING_FOR_SALE,
    Purchase: TransactionType.PURCHASE,
    'Listing for lease': TransactionType.LISTING_FOR_LEASE,
    'Listing for Lease': TransactionType.LISTING_FOR_LEASE,
    Lease: TransactionType.LEASE,
    Other: TransactionType.OTHER,
  };
}
