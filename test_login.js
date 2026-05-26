const axios = require('axios');

(async () => {
  try {
    console.log("Đang thử đăng nhập admin@example.com / 123456...");
    const res = await axios.post('http://localhost:4000/api/auth/login', {
      email: 'admin@example.com',
      password: '123456'
    });
    console.log("✅ Thành công:", res.data);
  } catch (error) {
    if (error.response) {
      console.log("❌ Lỗi từ server:", error.response.status, error.response.data);
    } else {
      console.log("❌ Lỗi mạng/khác:", error.message);
    }
  }
})();
