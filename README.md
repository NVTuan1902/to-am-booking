# T&T Home

Nền tảng đặt phòng homestay & khách sạn trực tuyến, hỗ trợ khách hàng tìm kiếm và đặt phòng theo thời gian thực, chủ cơ sở quản lý phòng và duyệt yêu cầu đặt phòng.

## Công nghệ sử dụng

- **Backend:** Node.js, NestJS, TypeScript
- **Cơ sở dữ liệu:** PostgreSQL, TypeORM
- **Xác thực:** JWT, bcrypt, phân quyền theo vai trò (RBAC)
- **Khác:** class-validator, Passport.js

## Vai trò trong hệ thống

- **Khách hàng (customer):** tìm phòng, đặt phòng
- **Chủ cơ sở (owner):** quản lý phòng, duyệt/từ chối yêu cầu đặt phòng
- **Quản trị viên (admin):** quản trị toàn hệ thống

## Các API đã hoàn thành

- Đăng ký / Đăng nhập tài khoản (mã hoá mật khẩu bằng bcrypt)
- Xác thực bằng JWT, phân quyền theo vai trò
- Quản lý phòng (tạo, xem danh sách)
- Đặt phòng với transaction + khoá dữ liệu (row-level lock), tránh đặt trùng lịch

## Đang phát triển

- Duyệt/từ chối booking (chủ cơ sở)
- Thanh toán qua webhook
- Bản đồ tìm kiếm theo vị trí