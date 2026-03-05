import { Injectable, NotFoundException } from '@nestjs/common';
import { Prompt } from '../../ai/entities/prompt.entity';
import { PromptRepository } from '../../ai/prompt.repository';

@Injectable()
export class AdminPromptService {
  constructor(private promptRepository: PromptRepository) {}

  async create(createPromptDto: Partial<Prompt>): Promise<Prompt> {
    const prompt = this.promptRepository.create(createPromptDto);
    return this.promptRepository.save(prompt);
  }

  async findAll(): Promise<Prompt[]> {
    return this.promptRepository.find();
  }

  async update(id: string, updatePromptDto: Partial<Prompt>): Promise<Prompt> {
    const prompt = await this.promptRepository.findOne({ where: { id } });
    if (!prompt) {
      throw new NotFoundException('Prompt not found');
    }
    Object.assign(prompt, updatePromptDto);
    return this.promptRepository.save(prompt);
  }

  async remove(id: string): Promise<void> {
    await this.promptRepository.delete(id);
  }
}
