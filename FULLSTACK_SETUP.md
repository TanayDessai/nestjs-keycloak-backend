# Full Stack Setup Guide - NestJS Keycloak User Management

This guide will help you set up and run the complete application stack including backend, frontend, PostgreSQL, and Keycloak.

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Docker and Docker Compose (for PostgreSQL and Keycloak)

## 🚀 Quick Start (Recommended)

### Step 1: Start Infrastructure Services

```bash
cd nestjs-keycloak-backend
docker-compose up -d
```

This starts:
- PostgreSQL on port 5432
- Keycloak on port 8080

Wait 30 seconds for services to fully start.

### Step 2: Configure Keycloak

1. **Access Keycloak Admin Console**
   - Open: http://localhost:8080
   - Login: `admin` / `admin`

2. **Configure admin-cli Client**
   - Navigate to: **Clients** → **admin-cli**
   - Enable: **Direct Access Grants Enabled** → ON
   - Click **Save**

3. **Create Superadmin User (Optional)**
   - Navigate to: **Users** → **Add User**
   - Username: `superadmin`
   - Email: `admin@example.com`
   - Email Verified: **ON**
   - Click **Save**
   - Go to **Credentials** tab
   - Set Password: `admin`
   - Temporary: **OFF**
   - Click **Set Password**

### Step 3: Start Backend

```bash
cd nestjs-keycloak-backend
npm install
npm run start:dev
```

Backend will run on: http://localhost:3000

### Step 4: Start Frontend

Open a new terminal:

```bash
cd nestjs-keycloak-frontend
npm install
npm start
```

Frontend will run on: http://localhost:3001

### Step 5: Test the Application

1. **Open browser**: http://localhost:3001
2. **Click "Get Started"** or **"Sign up here"**
3. **Fill registration form**:
   - First Name: John
   - Last Name: Doe
   - Username: johndoe
   - Email: john@example.com
   - Password: password123
4. **Click "Sign Up"**
5. **Login** with your credentials
6. **View your profile** with all details

## 📁 Project Structure

```
/home/tanayd/tanay/
├── nestjs-keycloak-backend/     # NestJS Backend
│   ├── src/
│   ├── docker-compose.yml       # PostgreSQL + Keycloak
│   ├── .env                     # Backend configuration
│   └── package.json
│
└── nestjs-keycloak-frontend/    # React Frontend
    ├── src/
    ├── public/
    └── package.json
```

## 🔧 Configuration

### Backend Configuration (.env)

Located at: `nestjs-keycloak-backend/.env`

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=keycloak_users

# Keycloak
KEYCLOAK_BASE_URL=http://localhost:8080
KEYCLOAK_REALM=master
KEYCLOAK_CLIENT_ID=admin-cli
KEYCLOAK_CLIENT_SECRET=
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin

# Application
PORT=3000
JWT_SECRET=your-jwt-secret-key-change-in-production
```

### Frontend Configuration

Located at: `nestjs-keycloak-frontend/src/services/api.ts`

```typescript
const API_BASE_URL = 'http://localhost:3000/api';
```

## 🎯 API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | User self-registration |
| POST | `/api/auth/login` | User login |

### Protected Endpoints (Requires Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get current user profile |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/users` | List all users (admin only) |
| POST | `/api/users` | Create user (admin only) |
| DELETE | `/api/users/:id` | Delete user (admin only) |

## 🧪 Testing the Complete Flow

### 1. User Registration Flow

**Frontend:**
```
1. Navigate to http://localhost:3001
2. Click "Get Started"
3. Fill signup form
4. Submit
```

**Backend Process:**
```
1. Receives POST /api/users/register
2. Creates user in Keycloak
3. Creates user in PostgreSQL
4. Returns success response
```

**Result:** User account created in both systems

### 2. User Login Flow

**Frontend:**
```
1. Navigate to login page
2. Enter username and password
3. Submit
```

**Backend Process:**
```
1. Receives POST /api/auth/login
2. Authenticates with Keycloak
3. Receives JWT tokens
4. Fetches user from PostgreSQL
5. Returns tokens + user data
```

**Result:** User logged in, redirected to profile

### 3. View Profile Flow

**Frontend:**
```
1. Automatically loads after login
2. Displays user information
```

**Backend Process:**
```
1. Receives GET /api/users/profile
2. Verifies JWT token with Keycloak
3. Fetches user from PostgreSQL
4. Returns user data
```

**Result:** Profile page shows all user details

### 4. Logout Flow

**Frontend:**
```
1. Click "Logout" button
```

**Backend Process:**
```
1. Receives POST /api/auth/logout
2. Revokes refresh token in Keycloak
3. Returns success
```

**Result:** User logged out, redirected to login

## 🔍 Verification Checklist

- [ ] Docker containers running (PostgreSQL + Keycloak)
- [ ] Keycloak accessible at http://localhost:8080
- [ ] Keycloak admin-cli client configured
- [ ] Backend running at http://localhost:3000
- [ ] Frontend running at http://localhost:3001
- [ ] Can access frontend home page
- [ ] Can register new user
- [ ] Registration creates entries in both Keycloak and PostgreSQL
- [ ] Can login with registered user
- [ ] Profile page displays user information
- [ ] Can logout successfully

## 🐛 Troubleshooting

### Backend Won't Start

**Error:** "Connection refused" to PostgreSQL
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart PostgreSQL
cd nestjs-keycloak-backend
docker-compose restart postgres
```

**Error:** "Failed to get admin token from Keycloak"
```bash
# Check if Keycloak is running
docker ps | grep keycloak

# Restart Keycloak
cd nestjs-keycloak-backend
docker-compose restart keycloak

# Wait 30 seconds for Keycloak to fully start
```

### Frontend Won't Connect to Backend

**Error:** "Network Error"
```bash
# Verify backend is running
curl http://localhost:3000/api/auth/login

# Check CORS is enabled in backend
# File: nestjs-keycloak-backend/src/main.ts
# Should have: app.enableCors()
```

### Registration Fails

**Error:** "User already exists in Keycloak"
```bash
# Delete user from Keycloak admin console
# Or use different username/email
```

**Error:** "Failed to register user"
```bash
# Check backend logs
# Verify Keycloak is accessible
# Ensure PostgreSQL is running
```

### Login Fails

**Error:** "Invalid credentials"
```bash
# Verify username and password are correct
# Check if user exists in Keycloak
# Try resetting password in Keycloak admin console
```

**Error:** "User not found in database"
```bash
# User exists in Keycloak but not PostgreSQL
# This indicates partial registration failure
# Delete user from Keycloak and register again
```

### Profile Page Shows "Loading..."

**Error:** Token validation fails
```bash
# Check if token is valid
# Verify Keycloak is running
# Try logging out and logging in again
```

## 📊 Database Verification

### Check PostgreSQL

```bash
# Connect to PostgreSQL
docker exec -it nestjs-postgres psql -U postgres -d keycloak_users

# List users
SELECT id, username, email, "firstName", "lastName", "isActive" FROM users;

# Exit
\q
```

### Check Keycloak

1. Open http://localhost:8080
2. Login as admin
3. Navigate to **Users**
4. Verify registered users appear

## 🔄 Restart Everything

If you encounter issues, restart all services:

```bash
# Stop all services
cd nestjs-keycloak-backend
docker-compose down
# Stop backend (Ctrl+C in terminal)
# Stop frontend (Ctrl+C in terminal)

# Start fresh
docker-compose up -d
# Wait 30 seconds
npm run start:dev  # In backend terminal
npm start          # In frontend terminal
```

## 📝 Development Workflow

### Making Backend Changes

```bash
cd nestjs-keycloak-backend
# Edit files in src/
# Backend auto-reloads with start:dev
```

### Making Frontend Changes

```bash
cd nestjs-keycloak-frontend
# Edit files in src/
# Frontend auto-reloads
```

### Viewing Logs

**Backend logs:**
```bash
# Visible in terminal running npm run start:dev
```

**Frontend logs:**
```bash
# Visible in terminal running npm start
# Also check browser console (F12)
```

**Docker logs:**
```bash
# PostgreSQL logs
docker logs nestjs-postgres

# Keycloak logs
docker logs nestjs-keycloak
```

## 🎨 Customization

### Change Frontend Port

Edit `nestjs-keycloak-frontend/package.json`:
```json
"scripts": {
  "start": "PORT=3001 react-scripts start"
}
```

### Change Backend Port

Edit `nestjs-keycloak-backend/.env`:
```env
PORT=3000
```

### Change Color Scheme

Edit CSS files in `nestjs-keycloak-frontend/src/pages/`:
- `Auth.css` - Login/Signup pages
- `Profile.css` - Profile page
- `Home.css` - Home page

## 🚀 Production Deployment

### Backend

1. Set `synchronize: false` in TypeORM config
2. Use environment variables for sensitive data
3. Enable HTTPS
4. Use production Keycloak instance
5. Set up proper CORS origins

### Frontend

1. Build production bundle: `npm run build`
2. Serve with nginx or similar
3. Update API_BASE_URL to production backend
4. Enable HTTPS

## 📚 Additional Resources

- **Backend README**: `nestjs-keycloak-backend/README.md`
- **Frontend README**: `nestjs-keycloak-frontend/README.md`
- **Backend Setup Guide**: `nestjs-keycloak-backend/SETUP_GUIDE.md`
- **Project Summary**: `nestjs-keycloak-backend/PROJECT_SUMMARY.md`

## 🎉 Success!

If everything is working:
- ✅ You can register new users
- ✅ Users can login
- ✅ Profile page shows user details
- ✅ Logout works correctly
- ✅ Data is stored in both Keycloak and PostgreSQL

Congratulations! Your full-stack application is running successfully! 🎊
