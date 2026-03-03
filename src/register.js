document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault(); // Ngăn load lại trang

    // 1. Lấy dữ liệu
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    const errorMsg = document.getElementById('errorMsg');
    const successMsg = document.getElementById('successMsg');

    // Ẩn các thông báo cũ đi trước khi xử lý
    errorMsg.classList.add('hidden');
    successMsg.classList.add('hidden');

    // 2. Kiểm tra mật khẩu khớp nhau (Logic Frontend)
    if (password !== confirmPassword) {
        errorMsg.innerText = "Mật khẩu xác nhận không khớp!";
        errorMsg.classList.remove('hidden');
        return; // Dừng lại, không gọi API nữa
    }

    // 3. Gọi API xuống Spring Boot
    try {
        const response = await fetch('http://localhost:8080/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, password: password })
        });

        if (response.ok) {
            // Nếu đăng ký thành công (Mã 200 OK)
            successMsg.classList.remove('hidden');

            // Đợi 1.5 giây cho người dùng đọc dòng chữ thành công, rồi tự chuyển sang trang Đăng nhập
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 1500);
        } else {
            // Nếu Backend báo lỗi (ví dụ: Email đã tồn tại) - Mã 400 Bad Request
            const errorText = await response.text();
            errorMsg.innerText = errorText;
            errorMsg.classList.remove('hidden');
        }
    } catch (error) {
        console.error("Lỗi:", error);
        errorMsg.innerText = "Không thể kết nối đến máy chủ!";
        errorMsg.classList.remove('hidden');
    }
});