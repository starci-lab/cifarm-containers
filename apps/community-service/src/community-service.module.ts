import { Module } from '@nestjs/common';
import { CommunityServiceController } from './community-service.controller';
import { CommunityServiceService } from './community-service.service';

@Module({
  imports: [],
  controllers: [CommunityServiceController],
  providers: [CommunityServiceService],
})
export class CommunityServiceModule {}
