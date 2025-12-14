# Quick Setup Guide

This guide will help you get the NestJS Keycloak backend up and running quickly.

## Step 1: Start Required Services

### Using Docker Compose (Recommended)

Start PostgreSQL and Keycloak with a single command:

```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Keycloak on port 8080

### Manual Setup (Alternative)

If you prefer to run services manually:

**PostgreSQL:**
```bash
# Install and start PostgreSQL
sudo systemctl start postgresql

# Create database
psql -U postgres -c "CREATE DATABASE keycloak_users;"
```

**Keycloak:**
```bash
docker run -d \
  --name keycloak \
  -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:latest \
  start-dev
```

## Step 2: Configure Keycloak

1. **Access Keycloak Admin Console**
   - Open browser: http://localhost:8080
   - Login with: admin / admin

2. **Configure admin-cli Client**
   - Go to: Clients → admin-cli
   - Settings:
     - Direct Access Grants: **Enabled**
     - Standard Flow: **Enabled**
     - Save changes

3. **Create Superadmin User**
   - Go to: Users → Add User
   - Username: `superadmin`
   - Email: `admin@example.com`
   - Email Verified: **On**
   - Save
   
   - Go to: Credentials tab
   - Set Password: `admin` (or your choice)
   - Temporary: **Off**
   - Save

4. **Assign Roles (Optional)**
   - Go to: Role Mappings tab
   - Assign realm roles as needed

## Step 3: Configure Application

1. **Update Environment Variables**

Edit `.env` file:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=keycloak_users

# Keycloak Configuration
KEYCLOAK_BASE_URL=http://localhost:8080
KEYCLOAK_REALM=master
KEYCLOAK_CLIENT_ID=admin-cli
KEYCLOAK_CLIENT_SECRET=
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin

# Application Configuration
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this
```

2. **Install Dependencies**

```bash
npm install
```

## Step 4: Start the Application

```bash
npm run start:dev
```

The application will be available at: http://localhost:3000

## Step 5: Test the API

### 1. Login as Superadmin

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "admin"
  }'
```

Save the `access_token` from the response.

### 2. Create a New User

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "firstName": "John",
    "lastName": "Doe",
    "roles": ["user"]
  }'
```

### 3. Login as New User

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "SecurePass123"
  }'
```

### 4. Get All Users

```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. Delete a User

```bash
curl -X DELETE http://localhost:3000/api/users/USER_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Using Postman

Import the `api-collection.json` file into Postman:

1. Open Postman
2. Click Import
3. Select `api-collection.json`
4. The collection includes all endpoints with pre-configured requests

## Verification Checklist

- [ ] PostgreSQL is running and accessible
- [ ] Keycloak is running at http://localhost:8080
- [ ] Keycloak admin-cli client is configured
- [ ] Superadmin user exists in Keycloak
- [ ] `.env` file is configured correctly
- [ ] Application starts without errors
- [ ] Can login as superadmin
- [ ] Can create new users
- [ ] New users can login
- [ ] Can delete users

## Troubleshooting

### "Failed to get admin token from Keycloak"
- Check if Keycloak is running
- Verify KEYCLOAK_BASE_URL in .env
- Verify admin credentials

### "Connection refused" to PostgreSQL
- Check if PostgreSQL is running
- Verify DB_HOST and DB_PORT in .env
- Check database credentials

### "User already exists in Keycloak"
- User with same username/email already exists
- Delete the user from Keycloak admin console or use different credentials

### "User not found in database"
- User exists in Keycloak but not in PostgreSQL
- This can happen if user creation partially failed
- Manually create the user or clean up Keycloak

## Next Steps

1. Configure additional Keycloak realms for different environments
2. Set up proper roles and permissions
3. Implement refresh token rotation
4. Add user profile update endpoints
5. Implement password reset functionality
6. Add email verification
7. Set up monitoring and logging
8. Deploy to production environment

## Production Considerations

Before deploying to production:

1. **Security:**
   - Change all default passwords
   - Use strong JWT secrets
   - Enable HTTPS/SSL
   - Configure Keycloak with proper database (not dev mode)
   - Set up proper CORS origins

2. **Database:**
   - Set `synchronize: false` in TypeORM config
   - Use migrations for schema changes
   - Set up database backups

3. **Keycloak:**
   - Use production mode
   - Configure with PostgreSQL/MySQL
   - Set up proper realm and client configurations
   - Enable security features (MFA, password policies)

4. **Application:**
   - Use environment-specific configurations
   - Set up proper logging
   - Configure monitoring and alerting
   - Use process managers (PM2, Docker)

## Support

For issues or questions, refer to:
- README.md for detailed documentation
- Keycloak documentation: https://www.keycloak.org/documentation
- NestJS documentation: https://docs.nestjs.com
