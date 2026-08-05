import swaggerJsdoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "CNM Computer E-Commerce & AI System API",
    version: "1.0.0",
    description: "Tài liệu API Hệ thống Thương mại điện tử Máy tính & Linh kiện kèm Module Tư vấn AI và Bảo hành.",
    contact: {
      name: "Đội ngũ Phát triển CNM",
      email: "support@cnm.local"
    }
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Development API Server"
    },
    {
      url: "http://localhost:8081/api",
      description: "Nginx Proxy / Production Server"
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Nhập Access Token JWT dạng: Bearer <token>"
      }
    }
  },
  tags: [
    { name: "Auth", description: "API Đăng ký, Đăng nhập, Xử lý Token & Tài khoản" },
    { name: "Products & Catalog", description: "API Tìm kiếm, Lọc danh mục, Thương hiệu & Sản phẩm" },
    { name: "Cart", description: "API Giỏ hàng người dùng" },
    { name: "Orders", description: "API Đặt hàng, Thanh toán VNPay/COD & Quản lý Đơn hàng" },
    { name: "PC Builder", description: "API Xây dựng cấu hình PC & Kiểm tra Tương thích Linh kiện" },
    { name: "Warranties", description: "API Tra cứu Bảo hành & Yêu cầu Bảo hành Sản phẩm" },
    { name: "Tickets", description: "API Vé hỗ trợ kỹ thuật Khách hàng" },
    { name: "AI Advisor", description: "API Tư vấn cấu hình & Giải đáp thắc mắc bằng AI" },
    { name: "Users & Staff", description: "API Quản lý Người dùng, Nhân viên & Phân quyền" },
    { name: "Health", description: "API Kiểm tra Trạng thái Hệ thống & CSDL" }
  ],
  paths: {
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Kiểm tra trạng thái API & kết nối CSDL PostgreSQL",
        responses: {
          "200": {
            description: "Hệ thống hoạt động bình thường",
            content: {
              "application/json": {
                example: {
                  status: "ok",
                  service: "api",
                  timestamp: "2026-08-04T08:56:43.977Z",
                  database: { connected: true, latencyMs: 15, database: "cnm_mk_hb" }
                }
              }
            }
          }
        }
      }
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Đăng ký tài khoản người dùng mới",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                email: "customer@cnm.local",
                password: "Customer@123",
                fullName: "Nguyễn Văn A",
                phone: "0901234567"
              }
            }
          }
        },
        responses: {
          "201": { description: "Đăng ký thành công" },
          "400": { description: "Dữ liệu nhập vào không hợp lệ hoặc Email đã tồn tại" }
        }
      }
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Đăng nhập hệ thống (Lấy JWT Access Token & Refresh Token)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                email: "admin@cnm.local",
                password: "Admin@123"
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Đăng nhập thành công",
            content: {
              "application/json": {
                example: {
                  success: true,
                  accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                  user: { id: 1, email: "admin@cnm.local", fullName: "System Admin", role: "ADMIN" }
                }
              }
            }
          },
          "401": { description: "Sai email hoặc mật khẩu" }
        }
      }
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Lấy thông tin tài khoản hiện tại (Yêu cầu Token)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Thành công" },
          "401": { description: "Chưa đăng nhập hoặc Token hết hạn" }
        }
      }
    },
    "/api/products": {
      get: {
        tags: ["Products & Catalog"],
        summary: "Lấy danh sách sản phẩm (Hỗ trợ phân trang, tìm kiếm & lọc)",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 12 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "brand", in: "query", schema: { type: "string" } }
        ],
        responses: {
          "200": { description: "Danh sách sản phẩm" }
        }
      }
    },
    "/api/products/{id}": {
      get: {
        tags: ["Products & Catalog"],
        summary: "Lấy chi tiết sản phẩm theo ID hoặc Slug",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          "200": { description: "Chi tiết sản phẩm" },
          "404": { description: "Không tìm thấy sản phẩm" }
        }
      }
    },
    "/api/cart": {
      get: {
        tags: ["Cart"],
        summary: "Lấy giỏ hàng của người dùng",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Thông tin giỏ hàng" }
        }
      },
      post: {
        tags: ["Cart"],
        summary: "Thêm sản phẩm vào giỏ hàng",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { productVariantId: 1, quantity: 1 }
            }
          }
        },
        responses: {
          "200": { description: "Đã cập nhật giỏ hàng" }
        }
      }
    },
    "/api/orders": {
      get: {
        tags: ["Orders"],
        summary: "Lấy danh sách đơn hàng người dùng / Quản trị",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Danh sách đơn hàng" }
        }
      },
      post: {
        tags: ["Orders"],
        summary: "Tạo đơn hàng mới",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                shippingAddress: "123 Nguyễn Văn Cừ, Q5, TP.HCM",
                paymentMethod: "COD",
                note: "Giao giờ hành chính"
              }
            }
          }
        },
        responses: {
          "201": { description: "Tạo đơn hàng thành công" }
        }
      }
    },
    "/api/pc-builder": {
      get: {
        tags: ["PC Builder"],
        summary: "Lấy linh kiện theo loại cho công cụ Build PC",
        parameters: [
          { name: "type", in: "query", schema: { type: "string" }, description: "Loại linh kiện: CPU, GPU, RAM, Mainboard..." }
        ],
        responses: {
          "200": { description: "Danh sách linh kiện tương thích" }
        }
      }
    },
    "/api/pc-builder/check": {
      post: {
        tags: ["PC Builder"],
        summary: "Kiểm tra độ tương thích giữa các linh kiện đã chọn",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                items: [{ skuId: 1, componentType: "CPU" }, { skuId: 2, componentType: "Mainboard" }]
              }
            }
          }
        },
        responses: {
          "200": { description: "Kết quả kiểm tra tương thích" }
        }
      }
    },
    "/api/warranties": {
      get: {
        tags: ["Warranties"],
        summary: "Lấy danh sách bảo hành của tôi",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Danh sách thẻ bảo hành" }
        }
      }
    },
    "/api/warranties/lookup/{code}": {
      get: {
        tags: ["Warranties"],
        summary: "Tra cứu thông tin bảo hành theo Mã bảo hành / SĐT / Đơn hàng",
        parameters: [
          { name: "code", in: "path", required: true, schema: { type: "string" }, example: "BH-1234" }
        ],
        responses: {
          "200": { description: "Thông tin thẻ bảo hành & tiến trình xử lý" }
        }
      }
    },
    "/api/ai-advisor/recommend": {
      post: {
        tags: ["AI Advisor"],
        summary: "Tư vấn cấu hình PC theo nhu cầu & ngân sách bằng AI",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                budget: 20000000,
                purpose: "Chơi game AAA và làm đồ họa 3D nhẹ"
              }
            }
          }
        },
        responses: {
          "200": { description: "Gợi ý cấu hình từ AI Advisor" }
        }
      }
    }
  }
};

const options = {
  swaggerDefinition,
  apis: []
};

export const swaggerSpec = swaggerJsdoc(options);
