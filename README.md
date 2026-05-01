# Chat App Backend

A RESTful + WebSocket chat application backend built with NestJS, Prisma, and PostgreSQL.

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT (Access Token + Refresh Token)
- **WebSocket**: Socket.IO

---

## Prerequisites

- Node.js v18+
- PostgreSQL
- npm

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd chat-app/backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

建立 `.env` 檔案：

```env
# Database
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<dbname>"

# JWT
JWT_ACCESS_SECRET="your_access_secret"
JWT_REFRESH_SECRET="your_refresh_secret"
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 4. Run Prisma migrations

```bash
npx prisma migrate dev
npx prisma generate
```

### 5. Start the server

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

Server runs on `http://localhost:3000`

---

## Database Schema

| Model        | Description          |
| ------------ | -------------------- |
| `User`       | 使用者帳號           |
| `Room`       | 聊天室               |
| `RoomMember` | 使用者與聊天室的關聯 |
| `Message`    | 聊天訊息             |

---

## REST API

### Auth

| Method | Endpoint         | Description       | Auth             |
| ------ | ---------------- | ----------------- | ---------------- |
| POST   | `/auth/register` | 註冊              | ❌               |
| POST   | `/auth/login`    | 登入              | ❌               |
| POST   | `/auth/refresh`  | 刷新 Access Token | ✅ Refresh Token |
| POST   | `/auth/logout`   | 登出              | ✅ Access Token  |

#### Register

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "testuser",
  "password": "password123"
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

---

### Chat

> 所有 Chat API 需要帶上 `Authorization: Bearer <accessToken>`

| Method | Endpoint                       | Description      |
| ------ | ------------------------------ | ---------------- |
| POST   | `/chat/rooms`                  | 建立聊天室       |
| GET    | `/chat/rooms`                  | 取得所有聊天室   |
| POST   | `/chat/rooms/:roomId/join`     | 加入聊天室       |
| DELETE | `/chat/rooms/:roomId/leave`    | 離開聊天室       |
| GET    | `/chat/rooms/:roomId/messages` | 取得聊天室訊息   |
| POST   | `/chat/messages`               | 發送訊息（REST） |

#### 建立聊天室

```http
POST /chat/rooms
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "name": "general"
}
```

#### 發送訊息

```http
POST /chat/messages
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "roomId": "<roomId>",
  "content": "Hello World!"
}
```

---

## WebSocket (Socket.IO)

### 連線

```javascript
const socket = io("http://localhost:3000", {
  auth: { token: "<accessToken>" },
});
```

### Events

| Event (emit)  | Payload               | Description |
| ------------- | --------------------- | ----------- |
| `joinRoom`    | `{ roomId }`          | 加入聊天室  |
| `leaveRoom`   | `{ roomId }`          | 離開聊天室  |
| `sendMessage` | `{ roomId, content }` | 發送訊息    |

| Event (on)   | Payload          | Description    |
| ------------ | ---------------- | -------------- |
| `joinedRoom` | `{ roomId }`     | 成功加入聊天室 |
| `leftRoom`   | `{ roomId }`     | 成功離開聊天室 |
| `newMessage` | `Message object` | 收到新訊息     |

### 測試範例（瀏覽器 Console）

```javascript
const socket = io("http://localhost:3000", {
  auth: { token: "YOUR_ACCESS_TOKEN" },
});

socket.on("connect", () => {
  socket.emit("joinRoom", { roomId: "YOUR_ROOM_ID" });
});

socket.on("joinedRoom", () => {
  socket.emit("sendMessage", {
    roomId: "YOUR_ROOM_ID",
    content: "Hello!",
  });
});

socket.on("newMessage", (msg) => console.log(msg));
```

---

## Project Structure

```
src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   └── jwt-refresh.strategy.ts
├── chat/
│   ├── dto/
│   │   ├── create-room.dto.ts
│   │   └── send-message.dto.ts
│   ├── chat.controller.ts
│   ├── chat.gateway.ts
│   ├── chat.module.ts
│   ├── chat.service.ts
│   └── ws-jwt.guard.ts
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── users/
│   ├── users.module.ts
│   └── users.service.ts
└── main.ts
prisma/
└── schema.prisma
```

---

## TODO

- [ ] WebSocket 測試
- [ ] Frontend 串接
