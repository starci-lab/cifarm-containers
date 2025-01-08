import { NestFactory } from '@nestjs/core';
import { TestModule } from './test.module';

async function bootstrap() {
  const app = await NestFactory.create(TestModule);
  await app.listen(process.env.port ?? 3200);
}
bootstrap();
