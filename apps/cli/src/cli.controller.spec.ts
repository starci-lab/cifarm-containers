import { Test, TestingModule } from '@nestjs/testing';
import { CliController } from './cli.controller';
import { CliService } from './cli.service';

describe('CliController', () => {
  let cliController: CliController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CliController],
      providers: [CliService],
    }).compile();

    cliController = app.get<CliController>(CliController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(cliController.getHello()).toBe('Hello World!');
    });
  });
});
