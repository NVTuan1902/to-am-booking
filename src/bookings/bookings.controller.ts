import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
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
}