# NestJS Keycloak User Management Backend

A comprehensive NestJS backend application with Keycloak integration for user authentication and management. This application provides superadmin capabilities to create, manage, and authenticate users with dual storage in both Keycloak and PostgreSQL.

## Features

- 🔐 **Keycloak Integration** - Full integration with Keycloak for authentication and authorization
- 👥 **User Management** - Create, read, and delete users
- 🔑 **Authentication** - Login/logout functionality with JWT tokens
- 🗄️ **Dual Storage** - User data stored in both Keycloak and PostgreSQL
- 🛡️ **Role-Based Access Control** - Superadmin and admin roles for user management
- ✅ **Validation** - Input validation using class-validator
- 🌐 **CORS Enabled** - Ready for frontend integration

## Prerequisites

Before running this application, ensure you have the following installed:

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Keycloak (v20 or higher)
- npm or yarn

## Installation

1. **Clone the repository** (if applicable)
   ```bash
   cd nestjs-keycloak-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```

   Update the following variables in `.env`:
   - Database credentials (PostgreSQL)
   - Keycloak URL and credentials
   - JWT secret

## Keycloak Setup

### 1. Start Keycloak

Using Docker:
```bash
docker run -d \
  --name keycloak \
  -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:latest \
  start-dev
```

### 2. Configure Keycloak

1. Access Keycloak admin console at `http://localhost:8080`
2. Login with admin credentials (admin/admin)
3. Create or use the `master` realm
4. Configure the `admin-cli` client:
   - Go to Clients → admin-cli
   - Enable "Direct Access Grants"
   - Set "Access Type" to "confidential" (if you want to use client secret)
   - Save and note the client secret from the "Credentials" tab

### 3. Create Superadmin User in Keycloak

1. Go to Users → Add User
2. Create a user with username `superadmin`
3. Set email and other details
4. Go to Credentials tab and set password
5. Go to Role Mappings and assign appropriate roles

## Database Setup

### 1. Create PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE keycloak_users;

# Exit
\q
```

### 2. Update Database Credentials

Update the `.env` file with your PostgreSQL credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=keycloak_users
```

## Running the Application

### Development Mode

```bash
npm run start:dev
```

The application will start on `http://localhost:3000`

### Production Mode

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

## API Endpoints

All endpoints are prefixed with `/api`

### Authentication Endpoints

#### 1. Login (Superadmin/User)
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "superadmin",
  "password": "your_password"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 300,
  "user": {
    "id": "uuid",
    "keycloakId": "keycloak-uuid",
    "username": "superadmin",
    "email": "admin@example.com",
    "firstName": "Super",
    "lastName": "Admin",
    "roles": ["superadmin"]
  }
}
```

#### 2. Logout
```http
POST /api/auth/logout
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "refresh_token": "your_refresh_token"
}
```

#### 3. Verify Token
```http
POST /api/auth/verify
Authorization: Bearer <access_token>
```

### User Management Endpoints

**Note:** All user management endpoints require authentication and superadmin/admin role.

#### 1. Create User
```http
POST /api/users
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "roles": ["user"]
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "keycloakId": "keycloak-uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": ["user"],
    "isActive": true
  }
}
```

#### 2. Get All Users
```http
GET /api/users
Authorization: Bearer <access_token>
```

#### 3. Get User by ID
```http
GET /api/users/:id
Authorization: Bearer <access_token>
```

#### 4. Delete User
```http
DELETE /api/users/:id
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

## Usage Flow

### 1. Superadmin Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "admin"
  }'
```

### 2. Create a New User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "Password123",
    "firstName": "New",
    "lastName": "User",
    "roles": ["user"]
  }'
```

### 3. New User Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "Password123"
  }'
```

### 4. Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "refresh_token": "YOUR_REFRESH_TOKEN"
  }'
```

### 5. Delete User
```bash
curl -X DELETE http://localhost:3000/api/users/USER_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Project Structure

```
nestjs-keycloak-backend/
├── src/
│   ├── auth/                      # Authentication module
│   │   ├── decorators/            # Custom decorators (Public, Roles)
│   │   ├── guards/                # Auth guards (JWT, Roles)
│   │   ├── strategies/            # Passport strategies
│   │   ├── auth.controller.ts     # Auth endpoints
│   │   ├── auth.service.ts        # Auth business logic
│   │   └── auth.module.ts         # Auth module definition
│   ├── keycloak/                  # Keycloak integration
│   │   ├── keycloak.service.ts    # Keycloak API client
│   │   └── keycloak.module.ts     # Keycloak module
│   ├── users/                     # User management module
│   │   ├── dto/                   # Data transfer objects
│   │   ├── entities/              # TypeORM entities
│   │   ├── users.controller.ts    # User endpoints
│   │   ├── users.service.ts       # User business logic
│   │   └── users.module.ts        # User module definition
│   ├── app.module.ts              # Root module
│   └── main.ts                    # Application entry point
├── .env                           # Environment variables
├── .env.example                   # Environment template
├── package.json                   # Dependencies
└── README.md                      # This file
```

## Architecture

### Dual Storage Strategy

When a user is created:
1. User is first created in Keycloak (authentication provider)
2. User details are then stored in PostgreSQL (application database)
3. Both records are linked via `keycloakId`

When a user is deleted:
1. User is removed from Keycloak
2. User record is removed from PostgreSQL

### Authentication Flow

1. User submits credentials to `/api/auth/login`
2. Application authenticates with Keycloak
3. Keycloak returns access and refresh tokens
4. Application verifies token and fetches user from PostgreSQL
5. User data and tokens are returned to client

## Security Considerations

- **Never commit `.env` file** - Contains sensitive credentials
- **Use strong JWT secrets** - Change the default JWT_SECRET in production
- **Enable HTTPS** - Use SSL/TLS in production
- **Keycloak Security** - Configure proper realm and client settings
- **Database Security** - Use strong passwords and restrict access
- **Role-Based Access** - Properly configure roles in Keycloak

## Troubleshooting

### Keycloak Connection Issues
- Ensure Keycloak is running on the specified URL
- Verify admin credentials are correct
- Check if the realm and client exist

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists

### Token Validation Errors
- Verify Keycloak realm configuration
- Check if client has proper permissions
- Ensure tokens haven't expired

## Development

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Linting
```bash
npm run lint
```

### Formatting
```bash
npm run format
```

## Technologies Used

- **NestJS** - Progressive Node.js framework
- **TypeORM** - ORM for TypeScript and JavaScript
- **PostgreSQL** - Relational database
- **Keycloak** - Identity and access management
- **Passport** - Authentication middleware
- **class-validator** - Validation decorators
- **Axios** - HTTP client for Keycloak API

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue in the repository.
