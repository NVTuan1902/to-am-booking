import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,
  ) {}

  create(dto: CreateRoomDto, ownerId: string): Promise<Room> {
    const room = this.roomsRepository.create({ ...dto, ownerId });
    return this.roomsRepository.save(room);
  }

  findAll(): Promise<Room[]> {
    return this.roomsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

}
