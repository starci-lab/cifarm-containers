import { Injectable } from '@nestjs/common';

@Injectable()
export class SetupService {
  getHello(): string {
    return 'Hello World!';
  }
}
