import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus } from './entities/booking.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @Post()
  create(@Body() dto: CreateBookingDto, @Request() req: any) {
    return this.bookingsService.create(dto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  findMine(@Request() req: any) {
    return this.bookingsService.findAllForCustomer(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner')
  @Get('owner')
  findForOwner(@Request() req: any) {
    return this.bookingsService.findAllForOwner(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner')
  @Patch(':id/approve')
  approve(@Param('id') id: string, @Request() req: any) {
    return this.bookingsService.updateStatus(
      id,
      BookingStatus.APPROVED,
      req.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner')
  @Patch(':id/reject')
  reject(@Param('id') id: string, @Request() req: any) {
    return this.bookingsService.updateStatus(
      id,
      BookingStatus.REJECTED,
      req.user.userId,
    );
  }
}