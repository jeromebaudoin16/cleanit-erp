import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { seedCleanITBooks } from './cleanitbooks/cleanitbooks.seed';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.enableCors({ origin: '*', methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('CleanIT ERP API')
    .setDescription('ERP Telecom Cameroun')
    .setVersion('2.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  await app.listen(3000);

  // Seed CleanITBooks au demarrage
  // Seed desactive pour serverless - trop lent au demarrage
  // await seedCleanITBooks(...);

  console.log('\n🚀 CleanIT ERP Backend: http://localhost:3000');
  console.log('📚 API Docs: http://localhost:3000/api/docs\n');
}
bootstrap();
