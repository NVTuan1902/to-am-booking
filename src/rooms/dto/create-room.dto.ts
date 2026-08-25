import { IsNotEmpty, IsNumber, IsOptional, IsPositive, Min } from 'class-validator';

export class CreateRoomDto {
  @IsNotEmpty({ message: 'Tên phòng không được để trống' })
  name!: string;

  @IsOptional()
  description?: string;

  @IsNumber({}, { message: 'Giá phòng phải là số' })
  @IsPositive({ message: 'Giá phòng phải lớn hơn 0' })
  pricePerNight!: number;

  @IsNumber()
  @Min(1, { message: 'Số khách tối đa phải ít nhất 1' })
  maxGuests!: number;

}
