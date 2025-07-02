import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Main');
  const config = new DocumentBuilder()
    .setTitle('Property Transaction Manager API')
    .setDescription(
      'API for managing property transactions, including properties, buyers, and sellers.',
    )
    .setVersion('1.0')
    .addTag('api')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  const port = process.env.PORT || 3000;
  const host = process.env.HOST || 'localhost';

  app.enableCors();

  // global prefix
  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove properties that don't have any decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted values are provided
      transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
      disableErrorMessages: false, // Enable error messages for better debugging
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
  logger.log(`Application running on: http://${host}:${port}`);
  logger.log(`API Base URL: http://${host}:${port}/api/v1`);
  logger.log(`Swagger Documentation: http://${host}:${port}/api`);
}
bootstrap().catch((error) =>
  console.error('Error starting application:', error),
);
