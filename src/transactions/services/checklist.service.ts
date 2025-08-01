import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Checklist } from '../entities/checklist.entity';
import { Workflow } from '../entities/workflow.entity';

@Injectable()
export class ChecklistService {
  private readonly logger = new Logger(ChecklistService.name);

  constructor(
    @InjectRepository(Checklist)
    private checklistRepository: Repository<Checklist>,
  ) {}

  async addChecklistToWorkflow(
    checklistName: string,
    workflow: Workflow,
  ): Promise<boolean> {
    try {
      const checklist = this.checklistRepository.create({
        name: checklistName,
        workflow: workflow,
      });

      await this.checklistRepository.save(checklist);
      this.logger.log(
        `Checklist "${checklistName}" added successfully to workflow ${workflow.id}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to add checklist "${checklistName}" to workflow ${workflow.id}`,
        error instanceof Error ? error.stack : String(error),
      );
      return false;
    }
  }
}
