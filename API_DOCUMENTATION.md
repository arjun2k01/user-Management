# User Management System - API Documentation

## Overview

Complete RESTful API for user authentication and management system built with Node.js, Express, and MongoDB.

## Quick Start

### Installation

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Requirements

- Node.js 14+
- MongoDB 4.0+
- npm or yarn

## API Endpoints

### Authentication Endpoints

#### 1. User Registration

**POST** `/api/v1/auth/signup`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Validation Rules:**
- Name: 2-50 characters
- Email: Valid email format, unique
- Password: Minimum 8 characters, requires uppercase, number, special character

---

#### 2. User Login

**POST** `/api/v1/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- 404: User not found
- 401: Invalid password
- 429: Too many login attempts (rate limited)

---

#### 3. Change Password

**POST** `/api/v1/auth/change-password`

Change password for authenticated user.

**Headers Required:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "oldPassword": "SecurePass123!",
  "newPassword": "NewSecurePass456!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### User Management Endpoints

#### 4. Get Current User

**GET** `/api/v1/users/me`

Retrieve current authenticated user's profile.

**Headers Required:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2025-12-11T12:00:00Z"
  }
}
```

---

#### 5. Get All Users

**GET** `/api/v1/users`

Retrieve paginated list of all users.

**Headers Required:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
- `page` (optional): Page number, default: 1
- `limit` (optional): Results per page, default: 10
- `search` (optional): Search by name

**Example Request:**
```
GET /api/v1/users?page=1&limit=10&search=john
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

---

#### 6. Get User by ID

**GET** `/api/v1/users/:id`

Retrieve specific user by ID.

**Headers Required:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2025-12-11T12:00:00Z"
  }
}
```

**Error Responses:**
- 404: User not found

---

#### 7. Update User

**PUT** `/api/v1/users/:id`

Update user information.

**Headers Required:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {...}
}
```

---

#### 8. Delete User

**DELETE** `/api/v1/users/:id`

Delete a user account.

**Headers Required:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## Security

### Authentication
- JWT (JSON Web Tokens) for stateless authentication
- Token expiration: 7 days
- Token included in Authorization header as Bearer token

### Rate Limiting
- General API: 100 requests per 15 minutes
- Authentication endpoints: 5 requests per 15 minutes
- Prevents brute force and DDoS attacks

### Input Validation
- Email format validation
- Password strength requirements
- Name length validation
- Sanitization of all inputs

### CORS
- Configured for specified origins only
- Default: localhost:5173 (Vite dev server)

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

## Common HTTP Status Codes

| Code | Meaning |
|------|------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Server Error |

## Environment Variables

See `.env.example` for complete list of configuration options.

**Key Variables:**
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT signing
- `PORT`: Server port (default: 5000)
- `CLIENT_URL`: Frontend URL for CORS

## Testing

### Using cURL

```bash
# Signup
curl -X POST http://localhost:5000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"SecurePass123!"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"SecurePass123!"}'

# Get Users (with token)
curl -X GET http://localhost:5000/api/v1/users \
  -H "Authorization: Bearer <TOKEN>"
```

### Using Postman

1. Import the `swagger.yaml` file
2. Set environment variables for token and baseUrl
3. Execute requests with proper headers

## Deployment

### Production Checklist

- [ ] Change `JWT_SECRET` to strong 64-character string
- [ ] Set `NODE_ENV=production`
- [ ] Configure `MONGO_URI` for MongoDB Atlas or production database
- [ ] Update `CLIENT_URL` to production frontend URL
- [ ] Enable `USE_HTTPS=true`
- [ ] Configure email service for password reset
- [ ] Set up monitoring and logging
- [ ] Enable database backups
- [ ] Configure CDN for static files

## Support

For issues or questions, contact: support@usermanagement.com

