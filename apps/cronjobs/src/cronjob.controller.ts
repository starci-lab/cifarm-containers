import { Controller, Get } from '@nestjs/common';
import { CronjobService } from './cronjob.service';

@Controller()
export class CronjobController {
  constructor(private readonly cronjobService: CronjobService) {}

  @Get()
  getHello(): string {
    return this.cronjobService.getHello();
  }
}
