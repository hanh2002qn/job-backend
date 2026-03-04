import { ApiProperty } from '@nestjs/swagger';

export class FeatureUsageStatDto {
  @ApiProperty()
  feature: string;

  @ApiProperty()
  totalTokens: number;

  @ApiProperty()
  totalRequests: number;

  @ApiProperty()
  totalCost: number;
}

export class ModelUsageStatDto {
  @ApiProperty()
  model: string;

  @ApiProperty()
  totalTokens: number;

  @ApiProperty()
  totalRequests: number;
}

export class DailyUsageStatDto {
  @ApiProperty()
  date: string;

  @ApiProperty()
  totalTokens: number;

  @ApiProperty()
  totalRequests: number;
}

export class TopUserStatDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  totalRequests: number;

  @ApiProperty()
  totalTokens: number;
}

export class OverallUsageStatsResponseDto {
  @ApiProperty()
  totalTokens: number;

  @ApiProperty()
  totalRequests: number;

  @ApiProperty()
  totalCost: number;

  @ApiProperty({ type: [FeatureUsageStatDto] })
  byFeature: FeatureUsageStatDto[];

  @ApiProperty({ type: [ModelUsageStatDto] })
  byModel: ModelUsageStatDto[];

  @ApiProperty({ type: [DailyUsageStatDto] })
  last7Days: DailyUsageStatDto[];
}

export class FeatureUsageStatsResponseDto {
  @ApiProperty()
  feature: string;

  @ApiProperty()
  totalTokens: number;

  @ApiProperty()
  totalRequests: number;

  @ApiProperty()
  totalCost: number;

  @ApiProperty()
  todayRequests: number;

  @ApiProperty({ type: [DailyUsageStatDto] })
  last7Days: DailyUsageStatDto[];

  @ApiProperty({ type: [TopUserStatDto] })
  topUsers: TopUserStatDto[];
}
