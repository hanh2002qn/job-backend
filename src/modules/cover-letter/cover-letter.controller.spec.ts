import { Test, TestingModule } from '@nestjs/testing';
import { CoverLetterController } from './cover-letter.controller';

describe('CoverLetterController', () => {
  let controller: CoverLetterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoverLetterController],
    }).compile();

    controller = module.get<CoverLetterController>(CoverLetterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
