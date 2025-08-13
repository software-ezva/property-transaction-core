import { ItemStatus } from '../../src/common/enums/item-status.enum';

/**
 * Helper function to map scenario strings to ItemStatus enum values.
 * This is useful for Cucumber tests where scenario strings need to be converted
 * to the corresponding enum values used in the application.
 */
export function mapToItemStatus(scenarioString: string): ItemStatus {
  const mappings: Record<string, ItemStatus> = {
    completed: ItemStatus.COMPLETED,
    Completed: ItemStatus.COMPLETED,
    'in progress': ItemStatus.IN_PROGRESS,
    'In progress': ItemStatus.IN_PROGRESS,
    'In Progress': ItemStatus.IN_PROGRESS,
    'not started': ItemStatus.NOT_STARTED,
    'Not started': ItemStatus.NOT_STARTED,
    'Not Started': ItemStatus.NOT_STARTED,
    pending: ItemStatus.NOT_STARTED,
    Pending: ItemStatus.NOT_STARTED,
  };

  const itemStatus = mappings[scenarioString];
  if (!itemStatus) {
    const availableStatuses = Object.keys(mappings).join(', ');
    throw new Error(
      `Unknown item status: "${scenarioString}". Available statuses: ${availableStatuses}`,
    );
  }

  return itemStatus;
}

/**
 * Get all available item status mappings for testing purposes
 */
export function getAvailableItemStatusMappings(): Record<string, ItemStatus> {
  return {
    completed: ItemStatus.COMPLETED,
    Completed: ItemStatus.COMPLETED,
    'in progress': ItemStatus.IN_PROGRESS,
    'In progress': ItemStatus.IN_PROGRESS,
    'In Progress': ItemStatus.IN_PROGRESS,
    'not started': ItemStatus.NOT_STARTED,
    'Not started': ItemStatus.NOT_STARTED,
    'Not Started': ItemStatus.NOT_STARTED,
    pending: ItemStatus.NOT_STARTED,
    Pending: ItemStatus.NOT_STARTED,
  };
}
