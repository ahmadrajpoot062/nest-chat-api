<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# NestJS Real-time Chat API

A full-featured real-time chat application API built with NestJS, MongoDB, Socket.IO, and JWT authentication.

## 📋 Features

- **Real-time Messaging**: Socket.IO integration for instant message delivery
- **User Authentication**: JWT-based secure authentication system
- **Room-based Chats**: Support for multiple chat rooms
- **REST API**: Well-structured endpoints for all operations
- **API Documentation**: Swagger UI for easy API exploration
- **Testing**: Comprehensive unit and E2E tests

## 🛠️ Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) v11
- **Database**: [MongoDB](https://www.mongodb.com/) with Mongoose
- **Authentication**: JWT with Passport.js
- **WebSockets**: Socket.IO
- **Validation**: class-validator & class-transformer
- **API Docs**: Swagger/OpenAPI
- **Testing**: Jest
- **Security**: Helmet for HTTP headers

## 🚀 Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)

### Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/ahmadrajpoot062/nest-chat-api
cd nest-chat-api
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment**

MongoDB should be running on `localhost:27017`. The application uses a database named `nest-chat`.

4. **Start the server**

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

5. **Access the API**

The server runs on http://localhost:3000 by default.  
API documentation is available at http://localhost:3000/api

## 🔒 Authentication

The API uses JWT tokens for authentication. To access protected endpoints:

1. Register a user via `/auth/register`
2. Login via `/auth/login` to get an access token
3. Use the token in the Authorization header: `Bearer <your_token>`

## 🖥️ API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Log in a user and get JWT token |

### Chat Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat/send` | Send a new chat message |
| GET | `/chat/:room` | Get messages from specific room |

## 📱 WebSocket Events

### Client to Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join` | `{ room: string }` | Join a specific chat room |
| `message` | `{ room: string, content: string }` | Send a message to the room |

### Server to Client

| Event | Payload | Description |
|-------|---------|-------------|
| `message` | Message object | Receive a new message |

### WebSocket Authentication

Connect to the WebSocket server by providing your JWT token as a query parameter:

```javascript
const socket = io('http://localhost:3000', {
  query: { token: 'your_jwt_token' }
});
```

## 🧪 Testing

The project includes comprehensive tests:

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run end-to-end tests
npm run test:e2e
```

## 🔧 Configuration

The following environment variables can be configured:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Application port |
| `MONGODB_URI` | mongodb://localhost:27017/nest-chat | MongoDB connection string |
| `JWT_SECRET` | ThisIsMySuperSecretKey123!@# | Secret for JWT signing |
| `JWT_EXPIRATION` | 1h | JWT token expiration |

## 📐 Project Structure

```
src/
├── auth/                   # Authentication module
│   ├── dto/                # Data transfer objects
│   ├── auth.controller.ts  # Authentication endpoints
│   ├── auth.service.ts     # Authentication logic
│   └── jwt.strategy.ts     # JWT authentication strategy
├── chat/                   # Chat module
│   ├── dto/                # Data transfer objects
│   ├── gateway/            # WebSocket gateway
│   ├── schemas/            # MongoDB schemas
│   ├── chat.controller.ts  # Chat REST endpoints
│   └── chat.service.ts     # Chat business logic
├── users/                  # Users module
│   ├── schemas/            # User schema
│   └── users.service.ts    # User management
├── app.module.ts           # Main application module
└── main.ts                 # Application entry point
```

## 🚨 Important Notes

- Default JWT key is `ThisIsMySuperSecretKey123!@#` - change this in production!
- The same secret key should be configured in both `auth.module.ts` and `jwt.strategy.ts`
- For production, consider moving configuration to environment variables
- MongoDB should be properly secured in production environments

## 🔍 Troubleshooting

**Connection refused errors**: Make sure MongoDB is running on the default port.

**WebSocket authentication errors**: Verify that you're providing a valid JWT token when connecting.

**E2E test failures**: Ensure that MongoDB is running when executing tests.

## 📄 License

[MIT](LICENSE)

## 🔄 Connecting with the Frontend

This backend is designed to work with the [nest-chat-ui](https://github.com/ahmadrajpoot062/nest-chat-ui) frontend project. 

### Setting Up the Full Application

1. **First, start this backend server** (runs on port 3000)
   ```bash
   # Navigate to the backend directory
   cd nest-chat-api/server
   
   # Install dependencies if you haven't already
   npm install
   
   # Create upload directories for avatars and files
   mkdir -p uploads/avatars
   
   # Start the development server
   npm run start:dev
   ```

2. **Then, clone and set up the frontend repository**
   ```bash
   # Clone the frontend repository
   git clone https://github.com/ahmadrajpoot062/nest-chat-ui.git
   
   # Navigate to the frontend directory
   cd nest-chat-ui
   
   # Install dependencies
   npm install
   
   # Start the frontend development server
   npm start
   ```
   
3. **The frontend will prompt you to run on a different port** since port 3000 is already in use by the backend. Choose "Yes" to run it on port 3001.

4. **Access the application** in your browser at [http://localhost:3001](http://localhost:3001)

### For Beginners: Common Issues

- **Backend must be running first**: Start the backend (this project) before starting the frontend.
  
- **MongoDB connection errors**: Ensure MongoDB is running before starting the backend.
  
- **File upload errors**: Make sure you've created the `uploads/avatars` and `uploads/files` directories.
  
- **CORS errors**: The backend is configured to accept requests from `http://localhost:3001` by default.

- **Avatar not showing**: Check that the path to the avatar directory is correct and that the files have proper permissions.
