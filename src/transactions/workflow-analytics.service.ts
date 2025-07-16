import { Injectable } from '@nestjs/common';
import { Transaction } from './entities/transaction.entity';
import { ItemStatus } from './entities/item.entity';

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

    // Obtener la fecha actual en UTC (sin hora)
    const today = new Date();
    const currentDate = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
    );

    let nextDate: Date | null = null;

    for (const checklist of transaction.workflow.checklists) {
      if (!checklist.items) continue;

      for (const item of checklist.items) {
        // Solo considerar items incompletos
        if (item.status !== ItemStatus.COMPLETED) {
          // Solo considerar items que tienen fecha de vencimiento
          if (item.expectClosingDate) {
            const itemDate = new Date(item.expectClosingDate);

            // Comparar fechas (ambas en UTC)
            if (itemDate >= currentDate) {
              if (!nextDate || itemDate < nextDate) {
                nextDate = itemDate;
              }
            }
          }
        }
      }
    }

    return nextDate;
  }
}
