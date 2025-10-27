# Base dự NodeJS

A base project nodejs backend

## Project Structure

```

src/
├── controllers/         # Xử lý logic của các API, gọi tới services
├── middlewares/         # Các middleware cho Express (xác thực, bắt lỗi, v.v.)
├── models/              # Định nghĩa schema/data models (ORM hoặc thuần)
├── routes/              # Định nghĩa các endpoint và ánh xạ controller tương ứng
├── services/            # Chứa logic xử lý nghiệp vụ (business logic)
├── shared/
│   ├── constants/       # Các hằng số dùng chung trong toàn dự án
│   └── utils/           # Các hàm tiện ích (helper functions)
├── guiline.txt          # Ghi chú hoặc guideline nội bộ
├── index.ts             # Entry point khởi chạy ứng dụng
└── type.d.ts            # Định nghĩa custom types cho TypeScript

```

## TechStack

### Core

- NodeJS 18
- TypeScript 5.8.3
- tsc-alias 1.8.16 - Hỗ trợ alias path sau khi biên dịch typescript

### Tooling & Development

- Nodemon 3.1.10
- Rimraf 5.0.10

### Linting & Formatting

- Eslint 9.31.0
- Prettier 3.6.2
- TypeScript Eslint 8.38.0
- eslint-config-prettier 10.1.8
- eslint-plugin-prettier 5.5.3

### Enviroment Configuration

- dotenv

## npm scripts

- `npm run dev`: chạy ứng dụng ở chế độ phát triển với nodemon
- `npm run build`: Xóa thư mục `dist`, biên dịch TypeScript và xử lý alias với `tsc-alias`
- `npm start`: Khởi chạy ứng dụng từ thư mục `dist` (production mode)
- `npm run lint`: Kiểm tra lỗi với `ESLint`
- `npm run lint:fix`: Tự động sửa lỗi ESLint có thể fix được
- `npm run prettier`: Kiểm tra định dạng mã nguồn theo cấu hình `Prettier`
- `npm run prettier`: Kiểm tra định dạng mã nguồn theo cấu hình `Prettier`
- `npm run prettier:fix`: Format lại toàn bộ mã nguồn theo chuẩn của `Prettier`
