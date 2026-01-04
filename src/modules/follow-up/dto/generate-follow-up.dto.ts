import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FollowUpType } from '../entities/follow-up.entity';

export class GenerateFollowUpDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    jobId: string;

    @ApiProperty({ enum: FollowUpType, default: FollowUpType.AFTER_APPLY })
    @IsOptional()
    @IsEnum(FollowUpType)
    type?: FollowUpType;

    @ApiProperty({ required: false, description: 'Tone of the email (professional, casual, enthusiastic)', example: 'professional' })
    @IsOptional()
    tone?: string;
}
