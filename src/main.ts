import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import { join } from 'path';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Helmet for basic security
  app.use(helmet());

  // ✅ Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // ✅ Allow large JSON and URL-encoded payloads
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  // ✅ Serve static files with proper CORS headers for avatar images
  app.use(
    '/uploads',
    express.static(join(__dirname, '..', 'uploads'), {
      setHeaders: (res) => {
        res.setHeader('Access-Control-Allow-Origin', '*'); // or your frontend origin
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); // ✅ important for image loading
      },
    }),
  );

  // ✅ Enable CORS for frontend (React app on port 3001)
  app.enableCors({
    origin: 'http://localhost:3001', // ✅ Adjust if your frontend runs on a different origin
    credentials: true,
  });

  // ✅ Swagger API documentation setup
  const config = new DocumentBuilder()
    .setTitle('Chat API')
    .setDescription('NestJS Real-time Chat Application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // ✅ Start server
  await app.listen(3000);
  console.log('✅ App is running at http://localhost:3000');
  console.log('📘 Swagger docs available at http://localhost:3000/api');
}

bootstrap();
