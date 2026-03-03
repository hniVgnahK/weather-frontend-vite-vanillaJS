// Lấy Token từ "két sắt"
const token = localStorage.getItem('jwtToken');
const guestMenu = document.getElementById('guestMenu');
const userMenu = document.getElementById('userMenu');

if (token) {
    console.log("Bạn đang đăng nhập với tư cách Thành viên!");
    // Hiện menu của Thành viên, ẩn menu của Khách
    userMenu.classList.remove('hidden');
    userMenu.classList.add('flex');
    guestMenu.classList.add('hidden');
} else {
    console.log("Bạn đang trải nghiệm với tư cách Khách.");
    // Hiện menu của Khách, ẩn menu của Thành viên
    guestMenu.classList.remove('hidden');
    guestMenu.classList.add('flex');
    userMenu.classList.add('hidden');
}

// XỬ LÝ NÚT ĐĂNG XUẤT
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        // 1. Xóa Token khỏi trình duyệt
        localStorage.removeItem('jwtToken');
        // 2. Tải lại trang (Trang sẽ tự động nhận diện là Khách và đổi giao diện)
        window.location.reload();
    });
}

// Lấy thời tiết Hà Nội ngay khi vào web
fetchWeatherData("Hanoi");

// Tải lịch sử tìm kiếm lên Sidebar
loadSearchHistory();

// HÀM GỌI API THỜI TIẾT
async function fetchWeatherData(cityName) {
    try {
        // Cấu hình Header linh hoạt
        const headers = {
            'Content-Type': 'application/json'
        };

        // NẾU CÓ TOKEN (Thành viên) -> Gắn thêm thẻ VIP vào Header
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`http://localhost:8080/api/weather/city?name=${cityName}`, {
            method: 'GET',
            headers: headers
        });

        if (response.ok) {
            const data = await response.json();

            // Cập nhật giao diện
            document.getElementById('cityNameDisplay').innerText = data.cityName;

            const currentWeather = data.forecasts[0];
            document.getElementById('mainTempDisplay').innerText = Math.round(currentWeather.temperature) + '°';
            document.getElementById('weatherDescDisplay').innerText =
                currentWeather.dateTime + ' • ' + currentWeather.description.toUpperCase();
            // 1. Cập nhật Độ ẩm (Dùng dấu || '--' để phòng trường hợp Backend không có dữ liệu)
            const humidity = currentWeather.humidity || 0;
            document.getElementById('humidityDisplay').innerText = humidity + '%';
            document.getElementById('humidityBar').style.width = humidity + '%'; // Thanh tiến trình chạy theo %

            // 2. Cập nhật Sức gió
            document.getElementById('windSpeedDisplay').innerText = currentWeather.windSpeed || '--';

            // 3. Cập nhật Áp suất
            // Tùy thuộc vào DTO Backend của bạn có trường pressure hay không. Nếu không có, nó sẽ hiện '--'
            document.getElementById('pressureDisplay').innerText = (currentWeather.pressure || '--') + ' hPa';

            // 4. Cập nhật Tầm nhìn (Từ mét chuyển sang km)
            if (currentWeather.visibility) {
                document.getElementById('visibilityDisplay').innerText = (currentWeather.visibility / 1000).toFixed(1) + ' km';
            } else {
                document.getElementById('visibilityDisplay').innerText = '-- km';
            }

            // --- XỬ LÝ DỰ BÁO 5 NGÀY ---
            const forecastContainer = document.getElementById('forecastContainer');
            forecastContainer.innerHTML = ''; // Xóa sạch dữ liệu cũ (nếu có) trước khi vẽ cái mới

            // Vòng lặp: Nhảy bước 8 (vì 24h / 3h = 8 mốc). Bắt đầu từ 0 đến hết mảng.
            for (let i = 0; i < data.forecasts.length; i += 8) {
                const dailyData = data.forecasts[i];

                // 1. Chuyển đổi "2026-03-02 15:00:00" thành tên thứ (Mon, Tue, Wed...)
                const dateObj = new Date(dailyData.dateTime);
                const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(dateObj);

                // 2. Lấy icon và nhiệt độ
                const icon = getWeatherIcon(dailyData.description);
                const temp = Math.round(dailyData.temperature);

                // 3. Tạo khuôn mẫu HTML cho 1 ngày (dùng Backtick ` để nối chuỗi nhiều dòng)
                const dayHTML = `
                    <div class="flex sm:flex-col items-center justify-between sm:justify-center p-4 gap-2">
                        <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">${i === 0 ? 'Today' : dayName}</p>
                        <div class="flex flex-col items-center gap-1">
                            <span class="material-symbols-outlined text-3xl text-primary">${icon}</span>
                        </div>
                        <div class="flex sm:flex-col gap-3 sm:gap-1 text-right sm:text-center">
                            <span class="text-lg font-bold text-slate-900 dark:text-white">${temp}°</span>
                        </div>
                    </div>
                `;

                // 4. Bơm khuôn mẫu này vào Container
                forecastContainer.innerHTML += dayHTML;
            }

            // Tự động tải lại lịch sử sau mỗi lần tìm kiếm thành công!
            loadSearchHistory();
        } else {
            alert("Không tìm thấy thành phố này hoặc có lỗi xảy ra!");
        }
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu thời tiết:", error);
    }
}

// BẮT SỰ KIỆN THANH TÌM KIẾM
const searchInput = document.getElementById('searchInput');

searchInput.addEventListener('keypress', function (event) {
    // Kiểm tra xem phím vừa nhấn có phải là phím Enter không
    if (event.key === 'Enter') {
        // Lấy chữ người dùng vừa nhập và xóa khoảng trắng ở 2 đầu (trim)
        const typedCity = searchInput.value.trim();

        if (typedCity !== '') {
            // Gọi hàm lấy thời tiết với tên thành phố mới
            console.log("Đang tìm thời tiết cho:", typedCity);
            fetchWeatherData(typedCity);

            // (Tùy chọn) Xóa chữ trong ô tìm kiếm sau khi enter để giao diện gọn gàng
            searchInput.value = '';

            // Tắt focus (bỏ nháy chuột) khỏi ô tìm kiếm
            searchInput.blur();
        }
    }
});

// Bắt sự kiện bấm nút Thêm Yêu Thích
document.getElementById('addFavoriteBtn').addEventListener('click', async () => {
    if (!token) {
        if (confirm("Bạn cần đăng nhập để lưu thành phố yêu thích. Chuyển đến trang Đăng nhập ngay?")) {
            window.location.href = '/login.html';
        }
        return;
    }

    // Lấy tên thành phố ĐANG HIỂN THỊ TRÊN MÀN HÌNH CHÍNH
    const currentCityName = document.getElementById('cityNameDisplay').innerText;

    try {
        const response = await fetch(`http://localhost:8080/api/favorites?cityName=${currentCityName}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            alert(`Đã thêm ${currentCityName} vào danh sách yêu thích!`);
            loadFavoriteCities(); // Cập nhật lại cột Sidebar ngay lập tức
        } else {
            // Nếu Backend báo lỗi (ví dụ: Thành phố đã tồn tại trong danh sách)
            const errorText = await response.text();
            alert(errorText);
        }
    } catch (error) {
        console.error("Lỗi thêm yêu thích:", error);
    }
});

// Hàm phiên dịch mô tả thời tiết thành Icon
function getWeatherIcon(description) {
    const desc = description.toLowerCase();
    if (desc.includes('rain')) return 'rainy';
    if (desc.includes('cloud')) return 'cloud';
    if (desc.includes('clear')) return 'sunny';
    if (desc.includes('snow')) return 'ac_unit';
    if (desc.includes('thunder')) return 'thunderstorm';
    return 'partly_cloudy_day'; // Icon mặc định
}

// HÀM XỬ LÝ LỊCH SỬ TÌM KIẾM
async function loadSearchHistory() {
    const historyContainer = document.getElementById('historyContainer');
    if (!historyContainer) return; // Nếu không tìm thấy thẻ trên HTML thì bỏ qua

    // 1. NẾU LÀ KHÁCH (CHƯA ĐĂNG NHẬP)
    if (!token) {
        historyContainer.innerHTML = `
            <li class="text-sm text-center py-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-dashed border-slate-300 dark:border-slate-600">
                <span class="text-slate-500 dark:text-slate-400">Bạn chưa đăng nhập.</span><br>
                <a href="/login.html" class="text-primary font-bold hover:underline mt-1 inline-block">Đăng nhập ngay</a>
            </li>
        `;
        return; // Dừng hàm lại, không gọi API nữa
    }

    // 2. NẾU LÀ THÀNH VIÊN (ĐÃ ĐĂNG NHẬP)
    try {
        // Gọi API lấy lịch sử từ Spring Boot
        const response = await fetch('http://localhost:8080/api/history', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const historyList = await response.json();
            historyContainer.innerHTML = ''; // Xóa thông báo cũ

            // Kiểm tra nếu danh sách trống
            if (historyList.length === 0) {
                historyContainer.innerHTML = `<li class="text-sm text-slate-500 italic">Chưa có lịch sử tìm kiếm.</li>`;
                return;
            }

            // Dùng vòng lặp để vẽ tối đa 5 lịch sử gần nhất
            historyList.slice(0, 5).forEach(item => {
                // Định dạng lại thời gian (Ví dụ: 10:30 AM)
                const dateObj = new Date(item.searchTime);
                const timeString = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(dateObj);

                const liHTML = `
                    <li class="flex items-center justify-between text-sm group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors" onclick="fetchWeatherData('${item.cityName}')">
                        <span class="font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">${item.cityName}</span>
                        <span class="text-slate-400 text-xs">${timeString}</span>
                    </li>
                `;
                historyContainer.innerHTML += liHTML;
            });
        }
    } catch (error) {
        console.error("Lỗi khi tải lịch sử:", error);
    }
}

window.fetchWeatherData = fetchWeatherData;

// --- 1. HÀM TẢI DANH SÁCH YÊU THÍCH ---
async function loadFavoriteCities() {
    const favoriteContainer = document.getElementById('favoriteContainer');
    if (!favoriteContainer) return;

    // Nếu là Khách
    if (!token) {
        favoriteContainer.innerHTML = `
            <div class="text-sm text-center py-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-600">
                <span class="text-slate-500 dark:text-slate-400">Đăng nhập để xem danh sách.</span>
            </div>
        `;
        return;
    }

    // Nếu là Thành viên
    try {
        const response = await fetch('http://localhost:8080/api/favorites', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const favorites = await response.json();
            favoriteContainer.innerHTML = ''; // Xóa thông báo cũ

            if (favorites.length === 0) {
                favoriteContainer.innerHTML = `<div class="text-sm text-slate-500 italic">Chưa có thành phố nào.</div>`;
                return;
            }

            favorites.forEach(city => {
                // Tạo giao diện cho mỗi thành phố (Thêm nút Xóa hình thùng rác)
                const cityHTML = `
                    <div class="group relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 p-4 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-transparent hover:border-slate-300 dark:hover:border-slate-600 flex justify-between items-center" 
                         onclick="fetchWeatherData('${city.cityName}')">
                        <div>
                            <h4 class="text-slate-900 dark:text-white font-bold text-base">${city.cityName}</h4>
                            <p class="text-slate-500 dark:text-slate-400 text-xs">Lat: ${city.lat.toFixed(2)}, Lon: ${city.lon.toFixed(2)}</p>
                        </div>
                        <div class="text-right">
                            <button onclick="removeFavorite(event, ${city.id})" class="text-slate-400 hover:text-red-500 transition-colors p-2" title="Xóa khỏi yêu thích">
                                <span class="material-symbols-outlined text-base">delete</span>
                            </button>
                        </div>
                    </div>
                `;
                favoriteContainer.innerHTML += cityHTML;
            });
        }
    } catch (error) {
        console.error("Lỗi tải yêu thích:", error);
    }
}

// --- 2. HÀM XÓA THÀNH PHỐ YÊU THÍCH ---
window.removeFavorite = async function(event, cityId) {
    event.stopPropagation(); // Ngăn click lan ra ngoài thẻ cha

    if (!confirm("Bạn có chắc muốn xóa thành phố này khỏi danh sách?")) return;

    try {
        const response = await fetch(`http://localhost:8080/api/favorites/${cityId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            loadFavoriteCities(); // Tải lại danh sách sau khi xóa thành công
        } else {
            alert("Có lỗi xảy ra khi xóa!");
        }
    } catch (error) {
        console.error("Lỗi xóa yêu thích:", error);
    }
}