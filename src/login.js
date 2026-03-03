// Bắt sự kiện khi người dùng bấm nút Đăng nhập
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // Ngăn trình duyệt tải lại trang

    // Lấy dữ liệu từ ô input
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');

    try {
        // Gọi API của Spring Boot (Nhớ đổi cổng 8080 nếu Backend của bạn chạy cổng khác)
        const response = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, password: password })
        });

        if (response.ok) {
            // Nếu thành công, Backend sẽ trả về cục JSON chứa token
            const data = await response.json();

            // Cất Token vào "két sắt" LocalStorage của trình duyệt
            localStorage.setItem('jwtToken', data.token);

            // Chuyển hướng người dùng sang trang Dashboard (index.html)
            window.location.href = '/index.html';
        } else {
            // Hiển thị dòng chữ báo lỗi
            errorMsg.classList.remove('hidden');
        }
    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        alert("Không thể kết nối đến Server Backend. Hãy chắc chắn Spring Boot đang chạy!");
    }
});