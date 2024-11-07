import { Module } from '@nestjs/common';
import { CronjobController } from './cronjob.controller';
import { CronjobService } from './cronjob.service';

@Module({
  imports: [],
  controllers: [CronjobController],
  providers: [CronjobService],
})
export class CronjobModule {}
