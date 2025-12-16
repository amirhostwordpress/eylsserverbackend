# LegalPath Nexus - Postman API Testing Guide

## 📋 Base Configuration

**Base URL:** `http://localhost:3000`

**Headers for Authenticated Requests:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

---

## 🔐 1. AUTHENTICATION ENDPOINTS

### 1.1 Login with Email/Password

**Method:** `POST`  
**URL:** `http://localhost:3000/api/auth/login`  
**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "admin@eyls.com",
  "password": "admin123"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@eyls.com",
      "name": "Super Admin",
      "role": "super_admin",
      "phone": "+919648555355"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**⚠️ SAVE THE TOKEN** - Copy the `token` value for use in subsequent requests

---

### 1.2 Request OTP

**Method:** `POST`  
**URL:** `http://localhost:3000/api/auth/otp/request`  
**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "phone": "+919648555355"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "sessionId": "otp_1234567890_0.123",
    "expiresIn": 600
  }
}
```

---

### 1.3 Verify OTP

**Method:** `POST`  
**URL:** `http://localhost:3000/api/auth/otp/verify`  
**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "sessionId": "otp_1234567890_0.123",
  "otp": "123456"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "user": { ... },
    "token": "...",
    "refreshToken": "..."
  }
}
```

---

### 1.4 Refresh Token

**Method:** `POST`  
**URL:** `http://localhost:3000/api/auth/refresh`  
**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "NEW_ACCESS_TOKEN"
  }
}
```

---

### 1.5 Forgot Password

**Method:** `POST`  
**URL:** `http://localhost:3000/api/auth/forgot-password`  
**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "admin@eyls.com"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset link sent to your email"
}
```

---

### 1.6 Reset Password

**Method:** `POST`  
**URL:** `http://localhost:3000/api/auth/reset-password`  
**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "token": "RESET_TOKEN_FROM_EMAIL",
  "newPassword": "newpassword123"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

## 👥 2. USER MANAGEMENT ENDPOINTS

### 2.1 Create New User (Super Admin Only)

**Method:** `POST`  
**URL:** `http://localhost:3000/api/users`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "coordinator1@eyls.com",
  "name": "John Coordinator",
  "phone": "+971501234567",
  "role": "coordinator",
  "assignedEmirates": ["Dubai", "Sharjah", "Ajman"]
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "User created successfully. Welcome email sent.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "coordinator1@eyls.com",
      "name": "John Coordinator",
      "role": "coordinator",
      "assignedEmirates": ["Dubai", "Sharjah", "Ajman"]
    },
    "temporaryPassword": "randomPass123"
  }
}
```

---

### 2.2 Get All Users (Super Admin Only)

**Method:** `GET`  
**URL:** `http://localhost:3000/api/users`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters (Optional):**
- `role` - Filter by role (e.g., `coordinator`)
- `isActive` - Filter by status (`true` or `false`)
- `search` - Search by name, email, or phone
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)

**Example URL with Filters:**
```
http://localhost:3000/api/users?role=coordinator&isActive=true&page=1&limit=20
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "coordinator1@eyls.com",
        "name": "John Coordinator",
        "role": "coordinator",
        "assignedEmirates": ["Dubai", "Sharjah"]
      }
    ],
    "pagination": {
      "total": 10,
      "page": 1,
      "limit": 20,
      "pages": 1
    }
  }
}
```

---

### 2.3 Get User by ID

**Method:** `GET`  
**URL:** `http://localhost:3000/api/users/{userId}`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Example URL:**
```
http://localhost:3000/api/users/123e4567-e89b-12d3-a456-426614174000
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "coordinator1@eyls.com",
      "name": "John Coordinator",
      "role": "coordinator",
      "phone": "+971501234567",
      "assignedEmirates": ["Dubai", "Sharjah"]
    }
  }
}
```

---

### 2.4 Update User

**Method:** `PUT`  
**URL:** `http://localhost:3000/api/users/{userId}`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "+971509999999",
  "assignedEmirates": ["Dubai", "Sharjah", "Abu Dhabi"],
  "isActive": true
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "user": { ... }
  }
}
```

---

### 2.5 Delete User (Super Admin Only)

**Method:** `DELETE`  
**URL:** `http://localhost:3000/api/users/{userId}`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### 2.6 Assign Emirates (Super Admin Only)

**Method:** `PUT`  
**URL:** `http://localhost:3000/api/users/{userId}/emirates`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "emirates": ["Dubai", "Sharjah", "Ajman", "Fujairah"]
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Emirates assigned successfully",
  "data": {
    "user": { ... }
  }
}
```

---

### 2.7 Change Password

**Method:** `POST`  
**URL:** `http://localhost:3000/api/users/change-password`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "admin123",
  "newPassword": "newpassword123"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 📁 3. CASE MANAGEMENT ENDPOINTS

### 3.1 Register New Case (Coordinator/Super Admin)

**Method:** `POST`  
**URL:** `http://localhost:3000/api/cases`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "clientName": "Ahmed Ali",
  "clientEmail": "ahmed@example.com",
  "clientPhone": "+971501111111",
  "emiratesId": "784-1990-1234567-1",
  "caseType": "Civil",
  "caseCategory": "Contract Dispute",
  "emirate": "Dubai",
  "courtArea": "Dubai Courts",
  "description": "Breach of contract regarding property sale",
  "urgencyLevel": "high",
  "estimatedCost": 25000
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Case registered successfully",
  "data": {
    "case": {
      "id": "uuid",
      "caseNumber": "CASE-2025-0001",
      "clientName": "Ahmed Ali",
      "status": "pending",
      "approvalStatus": "pending",
      "emirate": "Dubai"
    },
    "client": {
      "id": "uuid",
      "email": "ahmed@example.com",
      "role": "client"
    }
  }
}
```

---

### 3.2 Get All Cases (Role-Based)

**Method:** `GET`  
**URL:** `http://localhost:3000/api/cases`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters (Optional):**
- `status` - Filter by status (e.g., `pending`, `active`)
- `emirate` - Filter by emirate
- `search` - Search by case number, client name, or email
- `page` - Page number
- `limit` - Items per page

**Example URL:**
```
http://localhost:3000/api/cases?status=pending&emirate=Dubai&page=1&limit=20
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "cases": [
      {
        "id": "uuid",
        "caseNumber": "CASE-2025-0001",
        "clientName": "Ahmed Ali",
        "status": "pending",
        "emirate": "Dubai",
        "client": {
          "name": "Ahmed Ali",
          "email": "ahmed@example.com"
        },
        "coordinator": {
          "name": "John Coordinator"
        },
        "lawyer": null
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "pages": 3
    }
  }
}
```

---

### 3.3 Get Case by ID

**Method:** `GET`  
**URL:** `http://localhost:3000/api/cases/{caseId}`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "case": {
      "id": "uuid",
      "caseNumber": "CASE-2025-0001",
      "clientName": "Ahmed Ali",
      "clientEmail": "ahmed@example.com",
      "clientPhone": "+971501111111",
      "caseType": "Civil",
      "status": "pending",
      "emirate": "Dubai",
      "description": "Breach of contract...",
      "estimatedCost": 25000,
      "paidAmount": 0,
      "client": { ... },
      "coordinator": { ... },
      "lawyer": null,
      "tracking": [
        {
          "changeNumber": 1,
          "changeType": "case_registered",
          "description": "Case CASE-2025-0001 registered",
          "user": {
            "name": "John Coordinator"
          }
        }
      ]
    }
  }
}
```

---

### 3.4 Update Case

**Method:** `PUT`  
**URL:** `http://localhost:3000/api/cases/{caseId}`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "description": "Updated case description with new details",
  "urgencyLevel": "critical",
  "hearingDate": "2025-12-15T10:00:00Z",
  "estimatedCost": 30000
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Case updated successfully",
  "data": {
    "case": { ... }
  }
}
```

---

### 3.5 Assign Lawyer to Case

**Method:** `PUT`  
**URL:** `http://localhost:3000/api/cases/{caseId}/assign-lawyer`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "lawyerId": "lawyer-uuid-here"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Lawyer assigned successfully",
  "data": {
    "case": { ... }
  }
}
```

---

### 3.6 Update Case Status

**Method:** `PUT`  
**URL:** `http://localhost:3000/api/cases/{caseId}/status`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "active"
}
```

**Valid Status Values:**
- `pending`
- `active`
- `in_progress`
- `on_hold`
- `completed`
- `closed`
- `rejected`

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Status updated successfully",
  "data": {
    "case": { ... }
  }
}
```

---

### 3.7 Add Note to Case

**Method:** `POST`  
**URL:** `http://localhost:3000/api/cases/{caseId}/notes`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "note": "Client provided additional documents. Case is progressing well."
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Note added successfully"
}
```

---

### 3.8 Delete Case (Super Admin Only)

**Method:** `DELETE`  
**URL:** `http://localhost:3000/api/cases/{caseId}`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Case deleted successfully"
}
```

---

## 📄 4. DOCUMENT MANAGEMENT ENDPOINTS

### 4.1 Upload Document

**Method:** `POST`  
**URL:** `http://localhost:3000/api/documents/upload`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

**Form Data:**
- `file` - (File) The document to upload
- `caseId` - (Text) UUID of the case
- `category` - (Text) Document category (e.g., "contract", "evidence", "general")
- `description` - (Text) Document description

**Postman Setup:**
1. Select Body → form-data
2. Add key `file` with type `File`, choose your file
3. Add key `caseId` with type `Text`, value: case UUID
4. Add key `category` with type `Text`, value: "contract"
5. Add key `description` with type `Text`, value: "Client contract document"

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "document": {
      "id": "uuid",
      "caseId": "case-uuid",
      "fileName": "contract-1234567890.pdf",
      "originalFileName": "client_contract.pdf",
      "fileType": "application/pdf",
      "fileSize": 524288,
      "filePath": "cases/1234567890_contract.pdf",
      "fileUrl": "https://iahwservice.com/eylsuploads/cases/1234567890_contract.pdf",
      "category": "contract"
    }
  }
}
```

---

### 4.2 Get Documents by Case

**Method:** `GET`  
**URL:** `http://localhost:3000/api/documents/case/{caseId}`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": "uuid",
        "fileName": "contract-1234567890.pdf",
        "originalFileName": "client_contract.pdf",
        "fileUrl": "https://...",
        "category": "contract",
        "uploader": {
          "name": "John Coordinator",
          "role": "coordinator"
        },
        "createdAt": "2025-11-27T01:00:00Z"
      }
    ]
  }
}
```

---

### 4.3 Delete Document

**Method:** `DELETE`  
**URL:** `http://localhost:3000/api/documents/{documentId}`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

---

## 📅 5. CONSULTATION ENDPOINTS

### 5.1 Book Consultation (Public or Authenticated)

**Method:** `POST`  
**URL:** `http://localhost:3000/api/consultations`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN (optional)
```

**Request Body:**
```json
{
  "clientName": "Sara Ahmed",
  "clientEmail": "sara@example.com",
  "clientPhone": "+971502222222",
  "type": "video",
  "scheduledDate": "2025-12-01T14:00:00Z",
  "duration": 60,
  "price": 450,
  "notes": "Need consultation about divorce case"
}
```

**Consultation Types:**
- `in_person`
- `video`
- `phone`

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Consultation booked successfully",
  "data": {
    "consultation": {
      "id": "uuid",
      "clientName": "Sara Ahmed",
      "type": "video",
      "status": "pending",
      "scheduledDate": "2025-12-01T14:00:00Z",
      "price": 450
    }
  }
}
```

---

### 5.2 Get All Consultations

**Method:** `GET`  
**URL:** `http://localhost:3000/api/consultations`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "consultations": [
      {
        "id": "uuid",
        "clientName": "Sara Ahmed",
        "type": "video",
        "status": "pending",
        "scheduledDate": "2025-12-01T14:00:00Z"
      }
    ]
  }
}
```

---

### 5.3 Update Consultation

**Method:** `PUT`  
**URL:** `http://localhost:3000/api/consultations/{consultationId}`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "confirmed",
  "counsellorId": "counsellor-uuid",
  "outcomeNotes": "Consultation completed. Advised client on next steps."
}
```

**Valid Status Values:**
- `pending`
- `confirmed`
- `completed`
- `cancelled`
- `rescheduled`

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Consultation updated successfully",
  "data": {
    "consultation": { ... }
  }
}
```

---

## 💰 6. PAYMENT ENDPOINTS

### 6.1 Create Payment

**Method:** `POST`  
**URL:** `http://localhost:3000/api/payments`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "caseId": "case-uuid",
  "amount": 5000,
  "currency": "AED",
  "paymentMethod": "card",
  "notes": "First installment payment"
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Payment record created",
  "data": {
    "payment": {
      "id": "uuid",
      "caseId": "case-uuid",
      "amount": 5000,
      "currency": "AED",
      "status": "pending",
      "invoiceNumber": "INV-2025-0001",
      "invoiceDate": "2025-11-27T01:00:00Z"
    }
  }
}
```

---

### 6.2 Get All Payments

**Method:** `GET`  
**URL:** `http://localhost:3000/api/payments`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "uuid",
        "caseId": "case-uuid",
        "amount": 5000,
        "currency": "AED",
        "status": "pending",
        "invoiceNumber": "INV-2025-0001"
      }
    ]
  }
}
```

---

### 6.3 Get Payments by Case

**Method:** `GET`  
**URL:** `http://localhost:3000/api/payments/case/{caseId}`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "payments": [ ... ]
  }
}
```

---

## 📊 7. DASHBOARD ENDPOINTS

### 7.1 Super Admin Dashboard

**Method:** `GET`  
**URL:** `http://localhost:3000/api/dashboard/super-admin`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN (Super Admin)
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalCases": 150,
    "totalUsers": 45,
    "totalRevenue": 250000,
    "pendingCases": 20
  }
}
```

---

### 7.2 Coordinator Dashboard

**Method:** `GET`  
**URL:** `http://localhost:3000/api/dashboard/coordinator`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN (Coordinator)
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "myCases": 35,
    "pendingAssignment": 8,
    "activeCases": 27
  }
}
```

---

### 7.3 Lawyer Dashboard

**Method:** `GET`  
**URL:** `http://localhost:3000/api/dashboard/lawyer`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN (Lawyer)
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "assignedCases": 15,
    "activeCases": 12
  }
}
```

---

### 7.4 Client Dashboard

**Method:** `GET`  
**URL:** `http://localhost:3000/api/dashboard/client`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN (Client)
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "case": {
      "caseNumber": "CASE-2025-0001",
      "status": "active",
      "lawyer": {
        "name": "Sarah Smith",
        "email": "lawyer@eyls.com",
        "phone": "+971502345678"
      }
    },
    "totalPaid": 10000
  }
}
```

---

## 🔔 8. NOTIFICATION ENDPOINTS

### 8.1 Send SMS

**Method:** `POST`  
**URL:** `http://localhost:3000/api/notifications/sms`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN (Staff Only)
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user-uuid",
  "phone": "+971501234567",
  "message": "Your case status has been updated to Active"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "SMS sent successfully"
}
```

---

### 8.2 Send WhatsApp

**Method:** `POST`  
**URL:** `http://localhost:3000/api/notifications/whatsapp`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN (Staff Only)
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user-uuid",
  "phone": "+971501234567",
  "message": "Your consultation is scheduled for tomorrow at 2 PM"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "WhatsApp sent successfully"
}
```

---

### 8.3 Send Email

**Method:** `POST`  
**URL:** `http://localhost:3000/api/notifications/email`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN (Staff Only)
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user-uuid",
  "email": "client@example.com",
  "subject": "Case Update",
  "html": "<h1>Case Update</h1><p>Your case has been assigned to a lawyer.</p>"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

---

## ⚙️ 9. SETTINGS ENDPOINTS

### 9.1 Get All Settings

**Method:** `GET`  
**URL:** `http://localhost:3000/api/settings`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN (Super Admin Only)
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "settings": [
      {
        "key": "twilio_config",
        "value": { ... },
        "category": "notifications"
      }
    ]
  }
}
```

---

### 9.2 Get Setting by Key

**Method:** `GET`  
**URL:** `http://localhost:3000/api/settings/{key}`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN (Super Admin Only)
```

**Example:**
```
http://localhost:3000/api/settings/twilio_config
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "setting": {
      "key": "twilio_config",
      "value": { ... }
    }
  }
}
```

---

### 9.3 Update Setting

**Method:** `PUT`  
**URL:** `http://localhost:3000/api/settings/{key}`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN (Super Admin Only)
Content-Type: application/json
```

**Request Body:**
```json
{
  "value": {
    "enabled": true,
    "accountSid": "AC...",
    "authToken": "..."
  }
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Setting updated successfully",
  "data": {
    "setting": { ... }
  }
}
```

---

## 📧 10. SUBSCRIPTION ENDPOINTS

### 10.1 Subscribe to Newsletter

**Method:** `POST`  
**URL:** `http://localhost:3000/api/subscriptions`  
**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "subscriber@example.com",
  "userId": null,
  "source": "website"
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Subscribed",
  "data": {
    "subscription": {
      "id": 1,
      "email": "subscriber@example.com",
      "status": "subscribed"
    }
  }
}
```

---

### 10.2 Unsubscribe

**Method:** `POST`  
**URL:** `http://localhost:3000/api/subscriptions/unsubscribe`  
**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "subscriber@example.com"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Unsubscribed",
  "data": {
    "subscription": { ... }
  }
}
```

---

### 10.3 Get All Subscriptions

**Method:** `GET`  
**URL:** `http://localhost:3000/api/subscriptions`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN (Super Admin Only)
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "subscriber@example.com",
      "status": "subscribed"
    }
  ]
}
```

---

## 🧪 TESTING WORKFLOW

### Step 1: Health Check
First, verify the server is running:

**GET** `http://localhost:3000/`

Expected: 200 OK with server info

---

### Step 2: Login
Login to get JWT token:

**POST** `http://localhost:3000/api/auth/login`
```json
{
  "email": "admin@eyls.com",
  "password": "admin123"
}
```

**SAVE THE TOKEN** from response!

---

### Step 3: Create Users
Create coordinator, lawyer, counsellor:

**POST** `http://localhost:3000/api/users`
(Use token in Authorization header)

---

### Step 4: Register Case
Register a test case:

**POST** `http://localhost:3000/api/cases`

---

### Step 5: Upload Document
Upload a document to the case:

**POST** `http://localhost:3000/api/documents/upload`
(Use multipart/form-data)

---

### Step 6: Test Other Features
- Assign lawyer to case
- Update case status
- Book consultation
- Create payment
- Send notifications

---

## ⚠️ COMMON ERRORS

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided. Authorization denied."
}
```
**Solution:** Add `Authorization: Bearer YOUR_TOKEN` header

---

### 403 Forbidden
```json
{
  "success": false,
  "message": "You do not have permission to access this resource."
}
```
**Solution:** Use account with correct role

---

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [ ... ]
}
```
**Solution:** Check request body format

---

### 404 Not Found
```json
{
  "success": false,
  "message": "Route /api/wrong-endpoint not found"
}
```
**Solution:** Check endpoint URL

---

## 📝 POSTMAN COLLECTION IMPORT

You can import this as a Postman collection. Create a new collection with:

1. **Collection Variables:**
   - `base_url` = `http://localhost:3000`
   - `token` = (set after login)

2. **Pre-request Script for authenticated requests:**
```javascript
pm.request.headers.add({
    key: 'Authorization',
    value: 'Bearer ' + pm.collectionVariables.get('token')
});
```

3. **Test Script to save token from login:**
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.token) {
        pm.collectionVariables.set('token', jsonData.data.token);
    }
}
```

---

## ✅ COMPLETE TEST CHECKLIST

- [ ] Health check endpoint
- [ ] Login with email/password
- [ ] Request OTP
- [ ] Create coordinator user
- [ ] Create lawyer user
- [ ] Get all users
- [ ] Register new case
- [ ] Get all cases
- [ ] Assign lawyer to case
- [ ] Update case status
- [ ] Add note to case
- [ ] Upload document
- [ ] Get case documents
- [ ] Book consultation
- [ ] Create payment
- [ ] Get dashboard stats
- [ ] Send SMS notification
- [ ] Subscribe to newsletter
- [ ] Change password
- [ ] Update user emirates

---

**Happy Testing! 🚀**
