import { NestFactory } from '@nestjs/core';
import { CommunityServiceModule } from './community-service.module';

async function bootstrap() {
  const app = await NestFactory.create(CommunityServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
