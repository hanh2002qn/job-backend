import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiUsage } from '../../ai/entities/ai-usage.entity';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@ApiTags('Admin AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/ai')
export class AdminAiController {
  constructor(
    @InjectRepository(AiUsage)
    private aiUsageRepository: Repository<AiUsage>,
  ) {}

  @Get('usage')
  @ApiOperation({ summary: 'Get AI usage stats' })
  async getUsageStats() {
    const usages = await this.aiUsageRepository.find({
      order: { createdAt: 'DESC' },
      take: 100,
    });

    const totalTokens = await this.aiUsageRepository
      .createQueryBuilder('usage')
      .select('SUM(usage.totalTokens)', 'sum')
      .getRawOne<{ sum: string }>();

    return {
      total_tokens: Number(totalTokens?.sum || 0),
      recent_usages: usages,
    };
  }

  // Placeholder for Model Config (since we don't have SystemConfig entity yet)
  @Get('config')
  @ApiOperation({ summary: 'Get AI Model Config' })
  getConfig() {
    return {
      model: 'gemini-flash-latest',
      temperature: 0.7,
    };
  }
}
