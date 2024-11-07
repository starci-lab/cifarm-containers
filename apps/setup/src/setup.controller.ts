import { Controller, Get } from '@nestjs/common';
import { SetupService } from './setup.service';

@Controller()
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @Get()
  getHello(): string {
    return this.setupService.getHello();
  }
}
