import { Test, TestingModule } from '@nestjs/testing';
import { SetupController } from './setup.controller';
import { SetupService } from './setup.service';

describe('SetupController', () => {
  let setupController: SetupController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SetupController],
      providers: [SetupService],
    }).compile();

    setupController = app.get<SetupController>(SetupController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(setupController.getHello()).toBe('Hello World!');
    });
  });
});
