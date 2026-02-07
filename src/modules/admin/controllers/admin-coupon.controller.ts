import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { StripeService } from '../../subscription/stripe.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@ApiTags('admin/coupons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/coupons')
export class AdminCouponController {
  constructor(private readonly stripeService: StripeService) {}

  @Get()
  @ApiOperation({ summary: 'List all coupons' })
  async listCoupons() {
    return this.stripeService.listCoupons();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new coupon' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        percent_off: { type: 'number' },
        amount_off: { type: 'number' },
        currency: { type: 'string' },
        duration: { type: 'string', enum: ['once', 'repeating', 'forever'] },
        duration_in_months: { type: 'number' },
        name: { type: 'string' },
      },
    },
  })
  async createCoupon(@Body() body: any) {
    return this.stripeService.createCoupon(body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a coupon' })
  async deleteCoupon(@Param('id') id: string) {
    return this.stripeService.deleteCoupon(id);
  }
}
