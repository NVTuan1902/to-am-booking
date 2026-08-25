import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { Room } from '../rooms/entities/room.entity';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
  ) {}

  async create(dto: CreateBookingDto, customerId: string): Promise<Booking> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const room = await queryRunner.manager
        .createQueryBuilder(Room, 'room')
        .setLock('pessimistic_write')
        .where('room.id = :id', { id: dto.roomId })
        .getOne();

      if (!room) {
        throw new NotFoundException('Không tìm thấy phòng');
      }

      const overlapping = await queryRunner.manager
        .createQueryBuilder(Booking, 'booking')
        .where('booking.roomId = :roomId', { roomId: dto.roomId })
        .andWhere('booking.status IN (:...statuses)', {
          statuses: [BookingStatus.PENDING, BookingStatus.APPROVED],
        })
        .andWhere('booking.checkInDate < :checkOutDate', {
          checkOutDate: dto.checkOutDate,
        })
        .andWhere('booking.checkOutDate > :checkInDate', {
          checkInDate: dto.checkInDate,
        })
        .getOne();

      if (overlapping) {
        throw new ConflictException(
          'Phòng đã có người đặt hoặc đang chờ duyệt trong khoảng ngày này',
        );
      }

      const nights = Math.ceil(
        (new Date(dto.checkOutDate).getTime() -
          new Date(dto.checkInDate).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      const totalPrice = nights * Number(room.pricePerNight);

      const booking = queryRunner.manager.create(Booking, {
        roomId: dto.roomId,
        customerId,
        checkInDate: dto.checkInDate,
        checkOutDate: dto.checkOutDate,
        status: BookingStatus.PENDING,
        totalPrice,
      });
      const saved = await queryRunner.manager.save(booking);

      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  findAllForOwner(ownerId: string): Promise<Booking[]> {
    return this.bookingsRepository.find({
      relations: { room: true, customer: true },
      where: { room: { ownerId } },
      order: { createdAt: 'DESC' },
    });
  }

  findAllForCustomer(customerId: string): Promise<Booking[]> {
    return this.bookingsRepository.find({
      relations: { room: true },
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(
    bookingId: string,
    newStatus: BookingStatus.APPROVED | BookingStatus.REJECTED,
    ownerId: string,
  ): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId },
      relations: { room: true },
    });

    if (!booking) {
      throw new NotFoundException('Không tìm thấy booking');
    }
    if (booking.room.ownerId !== ownerId) {
      throw new ForbiddenException('Bạn không có quyền xử lý booking này');
    }
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Booking này đã được xử lý trước đó');
    }

    booking.status = newStatus;
    return this.bookingsRepository.save(booking);
  }
}
