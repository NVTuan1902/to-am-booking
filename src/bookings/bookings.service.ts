import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { Room } from '../rooms/entities/room.entity';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private dataSource: DataSource) {}

  async create(dto: CreateBookingDto, customerId: string): Promise<Booking> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // BƯỚC 1: Khoá dòng phòng này lại — ai khác đặt cùng phòng phải chờ
      const room = await queryRunner.manager
        .createQueryBuilder(Room, 'room')
        .setLock('pessimistic_write')
        .where('room.id = :id', { id: dto.roomId })
        .getOne();

      if (!room) {
        throw new NotFoundException('Không tìm thấy phòng');
      }

      // BƯỚC 2: Trong lúc đang khoá, kiểm tra có booking nào trùng ngày chưa
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

      // BƯỚC 3: Không trùng -> tính tiền và tạo booking mới
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

      // BƯỚC 4: Mọi thứ ổn -> xác nhận (commit), nhả khoá
      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      // Có lỗi bất kỳ đâu -> huỷ hết (rollback), không lưu gì cả
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}