Trong lập trình web và thiết kế giao diện, từ **"Shell"** (nghĩa đen là **cái vỏ / khung vỏ**) được dùng để chỉ **"Bộ khung bao bọc bên ngoài của một trang web"**.

Để dễ hình dung, một trang web luôn gồm 2 phần: **Vỏ (Shell)** và **Ruột (Content)**.

---

### 1. Phân biệt "Vỏ" và "Ruột"

```
┌─────────────────────────────────────────────────────────────┐
│ 🟢 KHUNG VỎ (SHELL)                                         │
│   ├── Thẻ <html>, <head>, CSS/JS chung, Font chữ             │
│   └── Header: Thanh điều hướng, Logo, Menu, Tìm kiếm...     │
├─────────────────────────────────────────────────────────────┤
│ 🔵 PHẦN RUỘT NỘI DUNG (CONTENT)                             │
│   └── Là nội dung chính của trang (Bài viết, Form đặt tour)  │
├─────────────────────────────────────────────────────────────┤
│ 🟢 KHUNG VỎ (SHELL)                                         │
│   └── Footer: Bản quyền, Mega menu chân trang, Mạng xã hội...│
└─────────────────────────────────────────────────────────────┘
```

- **Phần Ruột (Content):** Là form đặt tour (`[oishii_booking]`) nơi khách nhập tên, ngày đi, số lượng người, bấm thanh toán.
- **Phần Vỏ (Shell):** Là toàn bộ phần bao quanh phần ruột (Header, Footer, thẻ `<html>`, `<head>`, `<body>`).

---

### 2. Tại sao lại gọi là "Minimal Checkout Shell"?

Bình thường trong WordPress, cái **Vỏ** này do **Theme** quyết định. Nhưng vỏ của theme thường rất **"nặng và cồng kềnh"**:

- Menu chính có hàng tá link dẫn đi chỗ khác.
- Sidebar quảng cáo, thanh tìm kiếm.
- Mega Footer to đùng dưới đáy với 3–4 cột liên kết.

Khi vào khâu thanh toán, plugin dùng file `checkout-page.php` để **thay thế cái vỏ cồng kềnh của theme bằng một "Vỏ tối giản" (Minimal Shell)**:

- Nó tự tạo ra thẻ `<html>`, `<head>`, `<body>`.
- Header của vỏ này chỉ có mỗi cái Logo và icon ổ khóa.
- Footer của vỏ này chỉ có mỗi 1 dòng bản quyền + link điều khoản.
- Ở giữa vỏ, nó chừa chỗ (`the_content()`) để nhét cái form đặt tour vào.

---

### 💡 Tóm lại:

Khi nói **"Minimal standalone checkout shell"**, ta có thể hiểu đơn giản là:

> **"Bộ khung vỏ trang tối giản, độc lập dành riêng cho trang thanh toán"** (giúp bọc lấy form đặt tour mà không bị dính các menu/footer rườm rà của theme).
>
