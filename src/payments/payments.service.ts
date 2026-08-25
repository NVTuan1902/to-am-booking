import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PayOS } from '@payos/node';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';

@Injectable()
export class PaymentsService {
  private payOS: PayOS;

  constructor(
    @InjectRepository(Payment) private paymentsRepository: Repository<Payment>,
    @InjectRepository(Booking) private bookingsRepository: Repository<Booking>,
    private configService: ConfigService,
  ) {
    // SDK v2: constructor nhận 1 object config duy nhất, không phải 3 tham số riêng
    this.payOS = new PayOS({
      clientId: this.configService.get<string>('PAYOS_CLIENT_ID')!,
      apiKey: this.configService.get<string>('PAYOS_API_KEY')!,
      checksumKey: this.configService.get<string>('PAYOS_CHECKSUM_KEY')!,
    });
  }

  async createPaymentLink(bookingId: string, customerId: string) {
    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId },
      relations: { room: true },
    });
    if (!booking) throw new NotFoundException('Không tìm thấy booking');
    if (booking.customerId !== customerId) throw new ForbiddenException('Đây không phải booking của bạn');
    if (booking.status !== BookingStatus.APPROVED) throw new BadRequestException('Booking chưa được duyệt');

    const orderCode = Date.now();

    // SDK v2: dùng namespace theo resource -> payOS.paymentRequests.create(...)
    const link = await this.payOS.paymentRequests.create({
      orderCode,
      amount: Number(booking.totalPrice),
      description: `Thanh toan phong`.slice(0, 25),
      returnUrl: 'http://localhost:3000/payments/success',
      cancelUrl: 'http://localhost:3000/payments/cancel',
    });

    const payment = this.paymentsRepository.create({
      bookingId: booking.id,
      orderCode: String(orderCode),
      amount: booking.totalPrice,
      status: PaymentStatus.PENDING,
      checkoutUrl: link.checkoutUrl,
    });
    await this.paymentsRepository.save(payment);

    return { checkoutUrl: link.checkoutUrl, qrCode: link.qrCode, orderCode };
  }

  async handleWebhook(webhookBody: any) {
  const verified = await this.payOS.webhooks.verify(webhookBody);

  const payment = await this.paymentsRepository.findOne({
    where: { orderCode: String(verified.orderCode) },
  });

  if (!payment) return { success: false };

  if (verified.code === '00') {
    payment.status = PaymentStatus.PAID;
    await this.paymentsRepository.save(payment);
    await this.bookingsRepository.update(payment.bookingId, {
      status: BookingStatus.PAID,
    });
  }

  return { success: true };
  }
}
