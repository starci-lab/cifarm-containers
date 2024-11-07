import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { Logger } from '@nestjs/common'
import { SetupDataService } from './setup-data';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule)

    const setupDataService = app.get(SetupDataService);

    // Clear old data
    await setupDataService.clearData();

    // Seed new data
    await setupDataService.setupData();

    await app.close();
}
bootstrap();
