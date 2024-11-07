import { Injectable } from '@nestjs/common';

@Injectable()
export class CronjobService {
  getHello(): string {
    return 'Hello World!';
  }
}
