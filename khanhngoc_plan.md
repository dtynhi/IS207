Kế hoạch triển khai: Chức năng tạo coupon

Mục tiêu
- Thêm tính năng tạo coupon (mã giảm giá) cho hệ thống, cho phép admin tạo coupon với các thuộc tính: mã, mô tả, loại giảm giá (phần trăm hoặc tiền), giá trị, ngày bắt đầu/kết thúc, số lượng sử dụng tối đa, điều kiện áp dụng (tối thiểu đơn hàng, sản phẩm/nhóm sản phẩm), trạng thái (active/inactive).

Giả định
- Ứng dụng có backend (REST API hoặc GraphQL) và cơ sở dữ liệu quan hệ (MySQL/Postgres/SQLite).
- Có hệ thống xác thực và phân quyền (role admin).

Yêu cầu chấp nhận
1. Admin có thể tạo coupon qua API/Trang admin.
2. Coupon lưu vào DB với ràng buộc hợp lệ.
3. Coupon chỉ áp dụng trong khoảng thời gian và số lần cho phép.
4. Có unit/integration tests cho logic chính (validation, sử dụng giảm số lần, hết hạn).

Thiết kế DB (ví dụ SQL)
- Bảng: coupons
  - id (PK, uuid/serial)
  - code (string, unique, not null)
  - description (text, null)
  - type (enum: "percent" | "amount")
  - value (decimal) -- nếu percent thì lưu 0-100
  - starts_at (datetime)
  - ends_at (datetime)
  - max_uses (int, null) -- null = unlimited
  - used_count (int, default 0)
  - min_order_amount (decimal, default 0)
  - apply_to (json/text, null) -- danh sách product ids hoặc rules
  - status (enum: "active" | "inactive")
  - created_at, updated_at

API endpoints (REST)
- POST /api/admin/coupons
  - body: { code, description?, type, value, starts_at?, ends_at?, max_uses?, min_order_amount?, apply_to? }
  - auth: admin
  - responses: 201 + coupon, 400 validation errors

- GET /api/admin/coupons (list)
- GET /api/admin/coupons/:id
- PUT /api/admin/coupons/:id (update)
- DELETE /api/admin/coupons/:id (optional soft-delete)

Logic/Validation chính
- code: required, uppercase, trimmed, unique
- type: must là 'percent' hoặc 'amount'
- value: nếu percent => 0 < value <= 100; nếu amount => value > 0
- dates: nếu starts_at và ends_at tồn tại thì starts_at < ends_at
- max_uses: >=1 nếu cung cấp
- min_order_amount: >=0

Áp dụng coupon khi thanh toán
- Khi khách hàng áp coupon: kiểm tra tồn tại và status==active, trong thời gian, used_count < max_uses (nếu có), tổng đơn hàng >= min_order_amount, coupon áp cho sản phẩm/nếu có quy tắc.
- Khi chấp nhận: tính toán giảm giá (rounding hợp lý), ghi tăng used_count (transaction để tránh race condition). Nếu used_count đạt max_uses, mark expired/disabled hoặc vẫn kiểm tra mỗi lần.

Giao diện admin
- Form tạo coupon với các trường ở trên, có helper (auto-generate code button), validation phía client.
- Trang list hiển thị trạng thái, used_count, hạn dùng.

Migrations
- Tạo migration tạo bảng coupons với index trên code (unique), index trên ends_at và status nếu cần cho hiệu năng.

Kiểm thử
- Unit tests cho validation logic (giá trị, ngày, type).
- Integration tests cho API: tạo coupon, áp coupon thành công, từ chối khi hết hạn/đạt giới hạn, concurrency test mô phỏng nhiều request dùng coupon cùng lúc (đảm bảo used_count không vượt quá max_uses).

Bảo mật và vận hành
- Chỉ admin được phép tạo/update/delete coupon.
- Lưu logs audit khi admin tạo/cập nhật/xóa coupon.
- Rate limit API áp coupon để tránh abuse.

Bước triển khai (task breakdown)
1. Thiết kế migration và tạo bảng coupons (0.5d)
2. Viết model/entity và repository (0.5d)
3. Viết service xử lý validation và business logic (1d)
4. Viết API endpoints admin (0.5d)
5. Tạo UI admin form và list (1d)
6. Viết tests unit & integration (1d)
7. Kiểm thử manual, deploy (0.5d)

Tiêu chí hoàn thành
- API + UI cho admin hoạt động, coupon lưu được và hợp lệ.
- Tests chính chạy qua.
- Tài liệu ngắn mô tả cách dùng và schema.

Ví dụ migration SQL (Postgres)
```
CREATE TABLE coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(100) NOT NULL UNIQUE,
  description text,
  type varchar(10) NOT NULL,
  value numeric(10,2) NOT NULL,
  starts_at timestamp with time zone,
  ends_at timestamp with time zone,
  max_uses integer,
  used_count integer NOT NULL DEFAULT 0,
  min_order_amount numeric(10,2) NOT NULL DEFAULT 0,
  apply_to jsonb,
  status varchar(10) NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_coupons_status ON coupons(status);
CREATE INDEX idx_coupons_ends_at ON coupons(ends_at);
```

Ghi chú
- Nếu hệ thống có microservices, cân nhắc broadcast sự kiện coupon.created để các dịch vụ khác cập nhật cache.
- Với yêu cầu rollback dùng_count, dùng transaction/row-level lock hoặc optimistic locking.

Liên hệ
- Nếu muốn, sẽ bổ sung mẫu payload API cụ thể theo framework hiện tại (Express, Spring, Django, v.v.).
