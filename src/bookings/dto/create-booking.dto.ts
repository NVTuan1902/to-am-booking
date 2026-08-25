import { IsUUID, IsDateString } from 'class-validator';

export class CreateBookingDto {
  @IsUUID('4', { message: 'Mã phòng không hợp lệ' })
  roomId!: string;

  @IsDateString({}, { message: 'Ngày nhận phòng không hợp lệ' })
  checkInDate!: string;

  @IsDateString({}, { message: 'Ngày trả phòng không hợp lệ' })
  checkOutDate!: string;

}
