import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './services/transactions.service';
import { TransactionAccessService } from './services/transaction-access.service';
import { WorkflowService } from './services/workflow.service';
import { ItemService } from './services/item.service';
import { ItemUpdateService } from './services/item-update.service';
import { ChecklistService } from './services/checklist.service';
import { TransactionAuthorizationService } from './services/transaction-authorization.service';
import { TransactionsController } from './controllers/transactions.controller';
import { TransactionAccessController } from './controllers/transaction-access.controller';
import { WorkflowController } from './controllers/workflow.controller';
import { ItemsController } from './controllers/items.controller';
import { ItemUpdatesController } from './controllers/item-update.controller';
import { ChecklistController } from './controllers/checklist.controller';
import { WorkflowAnalyticsService } from './workflow-analytics.service';
import { Transaction } from './entities/transaction.entity';
import { Item } from './entities/item.entity';
import { ItemUpdate } from './entities/item-update.entity';
import { User } from '../users/entities/user.entity';
import { Property } from '../properties/entities/property.entity';
import { WorkflowTemplate } from '../templates/entities/workflow-template.entity';
import { Workflow } from './entities/workflow.entity';
import { Checklist } from './entities/checklist.entity';
import { TemplatesModule } from '../templates/templates.module';
import { UsersModule } from 'src/users/users.module';
import { PropertiesModule } from 'src/properties/properties.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction,
      Item,
      ItemUpdate,
      User,
      Property,
      WorkflowTemplate,
      Workflow,
      Checklist,
    ]),
    TemplatesModule,
    UsersModule,
    PropertiesModule,
  ],
  controllers: [
    TransactionsController,
    TransactionAccessController,
    WorkflowController,
    ItemsController,
    ItemUpdatesController,
    ChecklistController,
  ],
  providers: [
    TransactionsService,
    TransactionAccessService,
    WorkflowService,
    ItemService,
    ItemUpdateService,
    ChecklistService,
    TransactionAuthorizationService,
    WorkflowAnalyticsService,
  ],
  exports: [
    TransactionsService,
    TransactionAccessService,
    WorkflowService,
    ItemService,
    ItemUpdateService,
    ChecklistService,
    TransactionAuthorizationService,
    WorkflowAnalyticsService,
  ],
})
export class TransactionsModule {}
