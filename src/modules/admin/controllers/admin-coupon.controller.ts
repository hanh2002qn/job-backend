import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuditAction } from '../../../common/decorators/audit-log.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { StripeService } from '../../subscription/stripe.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import type Stripe from 'stripe';

@ApiTags('admin/coupons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/coupons')
export class AdminCouponController {
  constructor(private readonly stripeService: StripeService) {}

  @Get()
  @ApiOperation({ summary: 'List all coupons' })
  @ApiResponse({ status: 200, description: 'List of coupons returned.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Admin role required.' })
  async listCoupons(): Promise<Stripe.Response<Stripe.ApiList<Stripe.Coupon>>> {
    return this.stripeService.listCoupons();
  }

  @Post()
  @AuditAction({ action: 'CREATE_COUPON', module: 'COUPON' })
  @ApiOperation({ summary: 'Create a new coupon' })
  @ApiResponse({ status: 201, description: 'Coupon created.' })
  @ApiResponse({ status: 400, description: 'Invalid coupon parameters.' })
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
  async createCoupon(
    @Body() body: Stripe.CouponCreateParams,
  ): Promise<Stripe.Response<Stripe.Coupon>> {
    return this.stripeService.createCoupon(body);
  }

  @Delete(':id')
  @AuditAction({ action: 'DELETE_COUPON', module: 'COUPON' })
  @ApiOperation({ summary: 'Delete a coupon' })
  @ApiParam({ name: 'id', description: 'Stripe coupon ID' })
  @ApiResponse({ status: 200, description: 'Coupon deleted.' })
  @ApiResponse({ status: 404, description: 'Coupon not found.' })
  async deleteCoupon(@Param('id') id: string): Promise<Stripe.Response<Stripe.DeletedCoupon>> {
    return this.stripeService.deleteCoupon(id);
  }
}
