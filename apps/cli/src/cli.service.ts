import { Injectable } from '@nestjs/common';

@Injectable()
export class CliService {
  getHello(): string {
    return 'Hello World!';
  }
}
