import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';

let cachedApp: any;

async function bootstrap() {
  if (cachedApp) return cachedApp;
  
  const app = await NestFactory.create(AppModule, {
    cors: true,
    logger: false, // Desactiver logs pour aller plus vite
  });
  
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  await app.init(); // init() pas listen() pour serverless
  cachedApp = app;
  return cachedApp;
}

export default async function handler(req: any, res: any) {
  try {
    const app = await bootstrap();
    const server = app.getHttpAdapter().getInstance();
    return server(req, res);
  } catch(e) {
    res.status(500).json({ error: 'Server init failed', detail: e.message });
  }
}
