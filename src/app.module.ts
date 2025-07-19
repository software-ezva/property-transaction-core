import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UsersModule } from './users/users.module';
import { TransactionsModule } from './transactions/transactions.module';
import { TemplatesModule } from './templates/templates.module';
import { ConfigModule } from '@nestjs/config';
import { PropertiesModule } from './properties/properties.module';
import { AuthzModule } from './authz/authz.module';
import { DocumentsModule } from './documents/documents.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '5432'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [],
      synchronize: true,
      logging: true,
      // TODO:Setting synchronize: true shouldn't be used in production - otherwise you can lose production data.
      autoLoadEntities: true,
      extra: {
        timezone: process.env.DB_TIMEZONE || 'America/New_York',
      },
    }),
    UsersModule,
    TransactionsModule,
    TemplatesModule,
    PropertiesModule,
    AuthzModule,
    DocumentsModule,
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
