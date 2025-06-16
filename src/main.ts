import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Security headers
  app.use(helmet());

  // ✅ Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // ✅ Swagger config
  const config = new DocumentBuilder()
    .setTitle('Chat API')
    .setDescription('NestJS Real-time Chat Application')
    .setVersion('1.0')
    .addBearerAuth() // 🔐 Enable JWT auth in Swagger
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // http://localhost:3000/api

  await app.listen(3000);
  console.log('✅ App is running at http://localhost:3000');
  console.log('📘 Swagger docs available at http://localhost:3000/api');
}
bootstrap();
