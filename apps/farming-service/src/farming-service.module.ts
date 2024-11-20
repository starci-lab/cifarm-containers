import { Module } from '@nestjs/common';
import { FarmingServiceController } from './farming-service.controller';
import { FarmingServiceService } from './farming-service.service';

@Module({
  imports: [],
  controllers: [FarmingServiceController],
  providers: [FarmingServiceService],
})
export class FarmingServiceModule {}
