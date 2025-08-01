import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './services/transactions.service';
import { TransactionsController } from './transactions.controller';
import { WorkflowAnalyticsService } from './workflow-analytics.service';
import { Transaction } from './entities/transaction.entity';
import { User } from '../users/entities/user.entity';
import { Property } from '../properties/entities/property.entity';
import { WorkflowTemplate } from '../templates/entities/workflow-template.entity';
import { TemplatesModule } from '../templates/templates.module';
import { UsersModule } from 'src/users/users.module';
import { PropertiesModule } from 'src/properties/properties.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, User, Property, WorkflowTemplate]),
    TemplatesModule,
    UsersModule,
    PropertiesModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, WorkflowAnalyticsService],
  exports: [TransactionsService, WorkflowAnalyticsService],
})
export class TransactionsModule {}
