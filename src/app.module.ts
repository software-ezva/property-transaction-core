import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UsersModule } from './users/users.module';
import { TransactionsModule } from './transactions/transactions.module';
import { TemplatesModule } from './templates/templates.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PropertiesModule } from './properties/properties.module';
import { AuthzModule } from './authz/authz.module';
import { DocumentsModule } from './documents/documents.module';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision')
          .default('development'),
        PORT: Joi.number().default(3000),
        DB_SOCKET_PATH: Joi.string().optional(),
        DB_HOST: Joi.string().when('DB_SOCKET_PATH', {
          is: Joi.exist(),
          then: Joi.optional(),
          otherwise: Joi.required(),
        }),
        DB_PORT: Joi.number().default(5432),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        DB_SSL: Joi.boolean().default(false),
        AUTH0_ISSUER_URL: Joi.string().uri().required(),
        AUTH0_AUDIENCE: Joi.string().required(),
        FIREBASE_STORAGE_BUCKET: Joi.string().required(),
        // Credenciales opcionales (si faltan, se asume ADC)
        FIREBASE_PROJECT_ID: Joi.string().optional(),
        FIREBASE_CLIENT_EMAIL: Joi.string().email().optional(),
        FIREBASE_PRIVATE_KEY: Joi.string().optional(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction =
          configService.get<string>('NODE_ENV') === 'production';
        const socketPath = configService.get<string>('DB_SOCKET_PATH');
        const ssl = configService.get<boolean>('DB_SSL');

        return {
          type: 'postgres',
          host: socketPath || configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),
          schema: 'public',
          entities: [],
          synchronize: !isProduction,
          logging: true,
          autoLoadEntities: true,
          ssl: ssl ? { rejectUnauthorized: false } : false,
          extra: {
            timezone:
              configService.get<string>('DB_TIMEZONE') || 'America/New_York',
            ...(socketPath ? { socketPath } : {}),
          },
        };
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
