# Weather Forecast Dashboard (Frontend)

Đây là giao diện người dùng (Client-side) của ứng dụng Dự báo thời tiết. Dự án được thiết kế theo mô hình Single Page Application (SPA), sử dụng Vanilla JavaScript thuần túy kết hợp với công cụ build Vite siêu tốc và Tailwind CSS để mang lại trải nghiệm UI/UX mượt mà, hiện đại.

## Công nghệ sử dụng
* **Cốt lõi:** HTML5, CSS3, Vanilla JavaScript (ES6+)
* **Styling:** Tailwind CSS (hỗ trợ Dark/Light Mode)
* **Build Tool:** Vite
* **Icons:** Google Material Symbols
* **Kiến trúc:** Fetch API (Giao tiếp với RESTful Backend)

## Tính năng nổi bật
* **Giao diện động (Dynamic UI):** Cập nhật toàn bộ thông số thời tiết (nhiệt độ, độ ẩm, sức gió...) và dự báo 5 ngày mà không cần tải lại trang (No reload).
* **Luồng xác thực (Auth Flow):** Conditional Rendering (hiển thị có điều kiện) - Giao diện tự động thay đổi dựa trên trạng thái Khách (Guest) hoặc Thành viên (User).
* **Tích hợp Token:** Lưu trữ an toàn JWT trong LocalStorage và tự động đính kèm vào Header khi gọi API.
* **Responsive Design:** Giao diện co giãn hoàn hảo trên cả thiết bị di động (Mobile) và máy tính (Desktop).

## Hướng dẫn cài đặt và chạy dự án (Local Setup)

**Lưu ý quan trọng:** Để dự án này hoạt động đầy đủ tính năng (Đăng nhập, Lưu yêu thích), bạn cần khởi chạy [Dự án Backend Spring Boot](https://github.com/<tên-github-của-bạn>/weather-backend-springboot) ở cổng `8080` song song với dự án này.

1. Clone dự án về máy**
git clone [https://github.com/](https://github.com/)<tên-github-của-bạn>/weather-frontend-vanillajs.git

2. Cài đặt các gói thư viện (Dependencies)
    Di chuyển vào thư mục dự án và chạy lệnh: npm install (Terminal)

3. Khởi chạy môi trường phát triển (Dev Server)
    Chạy lệnh: npm run dev (Terminal)
    Dự án sẽ tự động chạy trên trình duyệt tại địa chỉ: http://localhost:5173
