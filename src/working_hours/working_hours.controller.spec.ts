import { Test, TestingModule } from '@nestjs/testing';
import { WorkingHoursController } from './working_hours.controller';
import { WorkingHoursService } from './working_hours.service';

describe('WorkingHoursController', () => {
  let controller: WorkingHoursController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkingHoursController],
      providers: [WorkingHoursService],
    }).compile();

    controller = module.get<WorkingHoursController>(WorkingHoursController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
