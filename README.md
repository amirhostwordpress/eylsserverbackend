# LegalPath Nexus Backend API

## 🚀 Overview

Complete RESTful API backend for the LegalPath Nexus legal case management system with:
- **Multi-role authentication** (Super Admin, Coordinator, Counsellor, Lawyer, Client)
- **JWT-based security**
- **Role-based access control (RBAC)**
- **Emirate-based filtering**
- **FTP document storage**
- **SMS/WhatsApp/Email notifications**
- **Comprehensive case management**

## 📋 Tech Stack

- **Runtime**: Node.js with ES Modules
- **Framework**: Express.js 5.x
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **File Upload**: Multer
- **FTP**: basic-ftp
- **SMS/WhatsApp**: Twilio
- **Email**: Nodemailer
- **Validation**: express-validator

## 🗂️ Project Structure

```
Backend/
├── config/              # Configuration files
│   ├── associations.js   # Model relationships
│   ├── database.js       # DB connection
│   ├── ftp.js           # FTP configuration
│   ├── jwt.js           # JWT utilities
│   ├── sequelize.js     # Sequelize setup
│   └── twilio.js        # Twilio configuration
│
├── models/              # Database models (8 models)
│   ├── user.model.js
│   ├── case.model.js
│   ├── caseTracking.model.js
│   ├── document.model.js
│   ├── consultation.model.js
│   ├── payment.model.js
│   ├── notification.model.js
│   ├── setting.model.js
│   └── subscription.model.js
│
├── controllers/         # Business logic (9 controllers)
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── case.controller.js
│   ├── document.controller.js
│   ├── consultation.controller.js
│   ├── payment.controller.js
│   ├── dashboard.controller.js
│   ├── notification.controller.js
│   ├── setting.controller.js
│   └── subscription.controller.js
│
├── routes/              # API endpoints (9 route files)
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── case.routes.js
│   ├── document.routes.js
│   ├── consultation.routes.js
│   ├── payment.routes.js
│   ├── dashboard.routes.js
│   ├── notification.routes.js
│   ├── setting.routes.js
│   └── subscription.routes.js
│
├── middleware/          # Express middleware
│   ├── auth.middleware.js
│   ├── authorize.middleware.js
│   ├── emirate.middleware.js
│   ├── upload.middleware.js
│   ├── validate.middleware.js
│   └── errorHandler.middleware.js
│
├── utils/               # Utility functions & services
│   ├── constants.js
│   ├── helpers.js
│   ├── ftpService.js
│   ├── smsService.js
│   ├── emailService.js
│   └── whatsappService.js
│
├── .env                 # Environment variables
├── .gitignore
├── index.js             # Main application
└── package.json
```

## ⚙️ Setup & Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create/update `.env` file:

```bash
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASS=7211
DB_NAME=legalpath_db
DB_PORT=3306

# JWT
JWT_SECRET=ksjdfsjdjjfkjsdfkasdkjaljsdf
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=ksjdfsjdjjfkjsdfkasdkjaljsdfrefresh
JWT_REFRESH_EXPIRES_IN=7d

# FTP
FTP_HOST=ftp.iahwservice.com
FTP_USER=u929535174.Uploads
FTP_PASS=Uploads@123321
FTP_PORT=21
FTP_BASE_URL=https://iahwservice.com/eylsuploads/

# Twilio (Optional)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_phone_number

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend
FRONTEND_URL=http://localhost:5173
```

### 3. Database Setup

The application will automatically create tables on first run. Ensure MySQL is running and create the database:

```sql
CREATE DATABASE legalpath_db;
```

### 4. Run the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server will start on `http://localhost:3000`

## 📡 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/login` | Email/password login | No |
| POST | `/otp/request` | Request OTP for phone | No |
| POST | `/otp/verify` | Verify OTP and login | No |
| POST | `/refresh` | Refresh access token | No |
| POST | `/forgot-password` | Request password reset | No |
| POST | `/reset-password` | Reset password with token | No |
| POST | `/logout` | Logout (client-side) | No |

### Users (`/api/users`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/` | Create new user | Yes | Super Admin |
| GET | `/` | Get all users | Yes | Super Admin |
| GET | `/:id` | Get user by ID | Yes | Any |
| PUT | `/:id` | Update user | Yes | Self/Super Admin |
| DELETE | `/:id` | Delete user | Yes | Super Admin |
| PUT | `/:id/emirates` | Assign emirates | Yes | Super Admin |
| POST | `/change-password` | Change password | Yes | Self |

### Cases (`/api/cases`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/` | Register new case | Yes | Coordinator/Super Admin |
| GET | `/` | Get all cases (filtered) | Yes | Any (role-based) |
| GET | `/:id` | Get case details | Yes | Any (permission-based) |
| PUT | `/:id` | Update case | Yes | Staff |
| DELETE | `/:id` | Delete case | Yes | Super Admin |
| PUT | `/:id/assign-lawyer` | Assign lawyer | Yes | Coordinator/Super Admin |
| PUT | `/:id/status` | Update status | Yes | Staff |
| POST | `/:id/notes` | Add note | Yes | Staff |

### Documents (`/api/documents`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/upload` | Upload document | Yes | Any |
| GET | `/case/:caseId` | Get case documents | Yes | Any (permission-based) |
| DELETE | `/:id` | Delete document | Yes | Coordinator/Super Admin |

### Consultations (`/api/consultations`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Book consultation | Optional |
| GET | `/` | Get all consultations | Yes |
| PUT | `/:id` | Update consultation | Yes |

### Payments (`/api/payments`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Create payment | Yes |
| GET | `/` | Get all payments | Yes (role-based) |
| GET | `/case/:caseId` | Get case payments | Yes |

### Dashboards (`/api/dashboard`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/super-admin` | Super Admin stats | Yes | Super Admin |
| GET | `/coordinator` | Coordinator stats | Yes | Coordinator |
| GET | `/lawyer` | Lawyer stats | Yes | Lawyer |
| GET | `/client` | Client stats | Yes | Client |

### Notifications (`/api/notifications`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/sms` | Send SMS | Yes | Staff |
| POST | `/whatsapp` | Send WhatsApp | Yes | Staff |
| POST | `/email` | Send Email | Yes | Staff |

### Settings (`/api/settings`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/` | Get all settings | Yes | Super Admin |
| GET | `/:key` | Get setting by key | Yes | Super Admin |
| PUT | `/:key` | Update setting | Yes | Super Admin |

### Subscriptions (`/api/subscriptions`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Subscribe | No |
| POST | `/unsubscribe` | Unsubscribe | No |
| GET | `/` | Get all subscriptions | Yes (Super Admin) |

## 🔐 Authentication

### Login Example

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@eyls.com",
  "password": "admin123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

### Using Authorization

Include JWT token in headers:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 👥 User Roles

### Default Test Users

| Role | Email | Password | Phone |
|------|-------|----------|-------|
| **Super Admin** | admin@eyls.com | admin123 | +919648555355 |
| **Coordinator** | coordinator@eyls.com | coord123 | +971501234567 |
| **Counsellor** | counsellor@eyls.com | counsel123 | +971504567890 |
| **Lawyer** | lawyer@eyls.com | lawyer123 | +971502345678 |
| **Client** | Auto-created during case registration | - | - |

### Role Permissions

- **Super Admin**: Full system access
- **Coordinator**: Case registration, assignment, emirate-restricted
- **Counsellor**: Consultation management, emirate-restricted
- **Lawyer**: Case management (assigned cases only)
- **Client**: View own case only

## 🌍 Emirates

Available emirates for assignment:
- Abu Dhabi
- Dubai
- Sharjah
- Ajman
- Umm Al Quwain
- Ras Al Khaimah
- Fujairah

## 📁 File Upload

### Supported File Types
- PDF: `application/pdf`
- Word: `.doc`, `.docx`
- Images: `.jpg`, `.jpeg`, `.png`, `.gif`

### File Size Limit
- Maximum: 10MB per file

### Upload Endpoint

```bash
POST /api/documents/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

Form Data:
- file: (binary)
- caseId: "uuid"
- category: "general"
- description: "Supporting document"
```

## 🔔 Notifications

### SMS (Twilio)
```javascript
POST /api/notifications/sms
{
  "userId": "uuid",
  "phone": "+971501234567",
  "message": "Your case status has been updated"
}
```

### WhatsApp (Twilio)
```javascript
POST /api/notifications/whatsapp
{
  "userId": "uuid",
  "phone": "+971501234567",
  "message": "Your consultation is scheduled"
}
```

### Email (Nodemailer)
```javascript
POST /api/notifications/email
{
  "userId": "uuid",
  "email": "client@example.com",
  "subject": "Case Update",
  "html": "<p>Your case has been updated</p>"
}
```

## 🛠️ Development

### Database Sync

The application automatically syncs database schema on startup in development mode.

To force reset (⚠️ WARNING: Deletes all data):
```javascript
// In config/database.js, change:
await sequelize.sync({ alter: doAlter });
// to:
await sequelize.sync({ force: true });
```

### Adding New Endpoints

1. Create controller in `controllers/`
2. Create routes in `routes/`
3. Import and use in `index.js`
4. Add middleware as needed

## 📊 Database Models

1. **User**: Authentication & user management
2. **Case**: Legal case information
3. **CaseTracking**: Case history & audit trail
4. **Document**: File metadata & FTP references
5. **Consultation**: Booking & scheduling
6. **Payment**: Financial transactions
7. **Notification**: Communication logs
8. **Setting**: System configuration

## 🚨 Error Handling

All endpoints return consistent error format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (dev only)"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Server Error

## 📝 License

Proprietary - LegalPath Nexus

## 🤝 Support

For issues or questions, contact the development team.

---

**Built with ❤️ for LegalPath Nexus**
