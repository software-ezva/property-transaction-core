import { Injectable } from '@nestjs/common';
import { Transaction } from './entities/transaction.entity';
import { ItemStatus } from '../common/enums';

@Injectable()
export class WorkflowAnalyticsService {
  calculateTotalWorkflowItems(transaction: Transaction): number {
    if (!transaction.workflow?.checklists) return 0;

    return transaction.workflow.checklists.reduce(
      (total, checklist) => total + (checklist.items?.length || 0),
      0,
    );
  }

  calculateCompletedWorkflowItems(transaction: Transaction): number {
    if (!transaction.workflow?.checklists) return 0;

    return transaction.workflow.checklists.reduce(
      (total, checklist) =>
        total +
        (checklist.items?.filter((item) => item.status === ItemStatus.COMPLETED)
          ?.length || 0),
      0,
    );
  }

  getNextIncompleteItemDate(transaction: Transaction): Date | null {
    if (!transaction.workflow?.checklists) return null;

    // Simple y directo - la configuración global de TZ ya maneja esto
    const today = new Date().toISOString().split('T')[0];
    let nextDateStr: string | null = null;

    for (const checklist of transaction.workflow.checklists) {
      if (!checklist.items) continue;

      for (const item of checklist.items) {
        // Only incomplete items
        if (item.status !== ItemStatus.COMPLETED) {
          // Only item with closing date
          if (item.expectClosingDate) {
            const itemDateStr =
              typeof item.expectClosingDate === 'string'
                ? item.expectClosingDate
                : item.expectClosingDate.toISOString().split('T')[0];

            // Comparación simple de strings YYYY-MM-DD
            if (
              itemDateStr >= today &&
              (!nextDateStr || itemDateStr < nextDateStr)
            ) {
              nextDateStr = itemDateStr;
            }
          }
        }
      }
    }

    // Retornar Date object o null
    return nextDateStr ? new Date(nextDateStr + 'T00:00:00.000Z') : null;
  }
}
