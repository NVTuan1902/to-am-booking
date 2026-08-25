import { Controller, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @Post('create/:bookingId')
  create(@Param('bookingId') bookingId: string, @Request() req: any) {
    return this.paymentsService.createPaymentLink(bookingId, req.user.userId);
  }

  @Post('webhook')
  webhook(@Body() body: any) {
    return this.paymentsService.handleWebhook(body);
  }
}