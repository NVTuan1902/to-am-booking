import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner')
  @Post()
  create(@Body() dto: CreateRoomDto, @Request() req: any) {
    return this.roomsService.create(dto, req.user.userId);
  }

  @Get()
  findAll() {
    return this.roomsService.findAll();
  }

}
