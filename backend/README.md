# Health & Wellness Backend API

A complete, production-ready Node.js backend API for a health and wellness mobile and web application with MongoDB and Express.js.

## Features

- **Authentication System**: JWT-based authentication with role-based access control
- **User Management**: User registration, login, profile management
- **Subscription System**: 4-tier subscription plans (Basic, Premium, Pro, Elite)
- **Chat System**: Weekly/monthly chat sessions based on subscription
- **Video Meetings**: Monthly 30-minute video meetings based on subscription
- **Symptom Tracking**: Daily symptom logging with analytics
- **Admin Panel**: Complete admin functionality for managing users and content
- **Health Categories**: Pre-loaded health and wellness content
- **Rate Limiting**: API rate limiting for security
- **Error Handling**: Comprehensive error handling and validation

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator
- **Password Hashing**: bcryptjs

## Quick Start

### 1. Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### 2. Environment Configuration

Update `.env` file with your configuration:

```bash
MONGODB_URI=mongodb://localhost:27017/healthwellness
JWT_SECRET=your_super_secure_jwt_secret_key_here
PORT=5000
NODE_ENV=production
FRONTEND_URL=http://localhost:3000
ADMIN_EMAIL=admin@healthwellness.com
ADMIN_PASSWORD=Admin@123456
```

### 3. Database Setup

```bash
# Seed the database with initial data
node scripts/seedData.js
```

### 4. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `DELETE /api/users/account` - Deactivate account

### Categories
- `GET /api/categories` - Get all health categories
- `GET /api/categories/:id` - Get specific category

### Subscriptions
- `GET /api/subscriptions` - Get subscription plans
- `POST /api/subscriptions/subscribe` - Subscribe to a plan
- `GET /api/subscriptions/my-subscription` - Get current subscription

### Chat
- `POST /api/chat/start` - Start new chat session
- `POST /api/chat/:chatId/message` - Send message
- `GET /api/chat/my-chats` - Get chat history
- `GET /api/chat/:chatId` - Get specific chat

### Meetings
- `POST /api/meetings/schedule` - Schedule video meeting
- `GET /api/meetings/my-meetings` - Get scheduled meetings
- `PUT /api/meetings/:meetingId/cancel` - Cancel meeting

### Symptoms
- `POST /api/symptoms/add` - Add daily symptoms
- `GET /api/symptoms/my-symptoms` - Get symptom history
- `GET /api/symptoms/today` - Get today's symptoms
- `GET /api/symptoms/analytics` - Get symptom analytics

### Admin Routes
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:userId` - Get user details
- `PUT /api/admin/users/:userId/status` - Update user status

## Subscription Plans

| Plan | Price | Chat | Video Meetings | Priority Support |
|------|-------|------|----------------|------------------|
| Basic | $9.99 | Monthly | 1/month | No |
| Premium | $19.99 | Weekly | 2/month | No |
| Pro | $39.99 | Weekly | 4/month | Yes |
| Elite | $69.99 | Weekly | 8/month | Yes |

## Authentication

Include JWT token in requests:

```javascript
headers: {
  'Authorization': 'Bearer your_jwt_token_here',
  'Content-Type': 'application/json'
}
```

## Response Format

All API responses follow this format:

```json
{
  "success": true|false,
  "message": "Response message",
  "data": {} // Response data (if applicable),
  "errors": [] // Validation errors (if applicable)
}
```

## Error Handling

The API includes comprehensive error handling for:
- Validation errors
- Authentication errors
- Database errors
- Server errors

## Default Credentials

After seeding the database:

**Admin Login:**
- Email: `admin@healthwellness.com`
- Password: `Admin@123456`

**Sample User Login:**
- Email: `john@example.com`
- Password: `password123`

## Health Check

Check if the server is running:

```bash
GET /health
```

## Security Features

- JWT authentication
- Password hashing
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- SQL injection protection

## Testing with Postman

1. Import the API endpoints into Postman
2. Set base URL to `http://localhost:5000/api`
3. For protected routes, add Authorization header with Bearer token
4. Use the seeded admin/user credentials for authentication

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a production MongoDB database
3. Set secure JWT_SECRET
4. Configure proper CORS origins
5. Use HTTPS in production
6. Set up proper logging and monitoring

## Support

For issues or questions, please check the error messages in the API responses. All errors are user-friendly and provide clear information about what went wrong.