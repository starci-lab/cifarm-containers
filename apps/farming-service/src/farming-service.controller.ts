import { Controller, Get } from '@nestjs/common';
import { FarmingServiceService } from './farming-service.service';

@Controller()
export class FarmingServiceController {
  constructor(private readonly farmingServiceService: FarmingServiceService) {}

  @Get()
  getHello(): string {
    return this.farmingServiceService.getHello();
  }
}
