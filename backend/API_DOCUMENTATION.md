# User Management API Documentation

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 1. Authentication Endpoints

### 1.1 User Signup
**POST** `/auth/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "507f...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "User"
  }
}
```

**Validation Rules:**
- Name: 2+ characters required
- Email: Valid email format required
- Password: Minimum 8 characters, must contain uppercase letter and number

**Rate Limiting:** 5 requests per 15 minutes per IP

---

### 1.2 User Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "507f...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "User"
  }
}
```

**Rate Limiting:** 5 requests per 15 minutes per IP

---

### 1.3 Change Password
**POST** `/auth/change-password`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "oldPassword": "SecurePass123",
  "newPassword": "NewSecurePass456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 2. User Management Endpoints

### 2.1 Get All Users (with Pagination, Filtering, Sorting)
**GET** `/users?page=1&limit=10&search=john&role=User&status=Active&sortBy=name&sortOrder=asc`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (default: 1): Page number for pagination
- `limit` (default: 10): Items per page
- `search` (optional): Search by name or email
- `role` (optional): Filter by role (Admin, Manager, User, All)
- `status` (optional): Filter by status (Active, Inactive, All)
- `sortBy` (default: createdAt): Sort field (name, email, createdAt)
- `sortOrder` (default: desc): Sort order (asc, desc)

**Response (200 OK):**
```json
{
  "success": true,
  "users": [
    {
      "_id": "507f...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "User",
      "status": "Active",
      "createdAt": "2025-12-11T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "totalPages": 10
}
```

**Rate Limiting:** 30 requests per minute

---

### 2.2 Get User by ID
**GET** `/users/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "_id": "507f...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "User",
    "status": "Active",
    "createdAt": "2025-12-11T00:00:00Z"
  }
}
```

---

### 2.3 Update User
**PUT** `/users/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Jane Doe",
  "role": "Manager",
  "status": "Active"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User updated",
  "user": {
    "_id": "507f...",
    "name": "Jane Doe",
    "role": "Manager",
    "status": "Active"
  }
}
```

**Valid Roles:** Admin, Manager, User
**Valid Status:** Active, Inactive

---

### 2.4 Delete User
**DELETE** `/users/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## 3. Health Check

### 3.1 Server Health
**GET** `/health`

**Response (200 OK):**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

---

## Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid or expired token"
}
```

### 409 - Conflict
```json
{
  "success": false,
  "statusCode": 409,
  "message": "Email already exists"
}
```

### 429 - Too Many Requests
```json
{
  "statusCode": 429,
  "message": "Too many requests from this IP, please try again later."
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "statusCode": 500,
  "message": "Internal Server Error"
}
```

---

## Rate Limiting

- **Authentication routes (signup, login):** 5 requests per 15 minutes
- **API endpoints (user management):** 30 requests per minute
- **General API:** 100 requests per 15 minutes

Rate limit info is returned in response headers:
```
RateLimit-Limit: 100
RateLimit-Remaining: 99
RateLimit-Reset: 1234567890
```

---

## Testing with cURL

### Signup
```bash
curl -X POST http://localhost:5000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"Pass123456"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"Pass123456"}'
```

### Get Users
```bash
curl -X GET "http://localhost:5000/api/v1/users?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Version History
- **v1.0.0** - Initial release with authentication and user management endpoints
