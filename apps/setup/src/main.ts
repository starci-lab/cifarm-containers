import { NestFactory } from '@nestjs/core';
import { SetupModule } from './setup.module';

async function bootstrap() {
  const app = await NestFactory.create(SetupModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
