import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './services/transactions.service';
import { WorkflowService } from './services/workflow.service';
import { ItemService } from './services/item.service';
import { TransactionAuthorizationService } from './services/transaction-authorization.service';
import { TransactionsController } from './controllers/transactions.controller';
import { WorkflowController } from './controllers/workflow.controller';
import { ItemsController } from './controllers/items.controller';
import { WorkflowAnalyticsService } from './workflow-analytics.service';
import { Transaction } from './entities/transaction.entity';
import { Item } from './entities/item.entity';
import { User } from '../users/entities/user.entity';
import { Property } from '../properties/entities/property.entity';
import { WorkflowTemplate } from '../templates/entities/workflow-template.entity';
import { Workflow } from './entities/workflow.entity';
import { TemplatesModule } from '../templates/templates.module';
import { UsersModule } from 'src/users/users.module';
import { PropertiesModule } from 'src/properties/properties.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction,
      Item,
      User,
      Property,
      WorkflowTemplate,
      Workflow,
    ]),
    TemplatesModule,
    UsersModule,
    PropertiesModule,
  ],
  controllers: [TransactionsController, WorkflowController, ItemsController],
  providers: [
    TransactionsService,
    WorkflowService,
    ItemService,
    TransactionAuthorizationService,
    WorkflowAnalyticsService,
  ],
  exports: [
    TransactionsService,
    WorkflowService,
    ItemService,
    TransactionAuthorizationService,
    WorkflowAnalyticsService,
  ],
})
export class TransactionsModule {}
