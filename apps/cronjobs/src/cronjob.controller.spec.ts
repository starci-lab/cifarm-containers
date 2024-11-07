import { Test, TestingModule } from '@nestjs/testing';
import { CronjobController } from './cronjob.controller';
import { CronjobService } from './cronjob.service';

describe('CronjobController', () => {
  let cronjobController: CronjobController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CronjobController],
      providers: [CronjobService],
    }).compile();

    cronjobController = app.get<CronjobController>(CronjobController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(cronjobController.getHello()).toBe('Hello World!');
    });
  });
});
