# MediSecure DynamoDB Schema Design

## Healthcare Data Management - Day 2 Implementation

### 🎯 Database Requirements

- **HIPAA Compliance**: Encrypted at rest and in transit
- **Scalability**: Handle growing patient data efficiently
- **Performance**: Fast query patterns for medical records
- **Security**: Role-based access control and audit logging
- **Backup**: Point-in-time recovery for critical data

---

## 📊 Table Design Strategy

### Design Principles

1. **Single Table Design**: Use DynamoDB best practices for NoSQL
2. **Access Patterns First**: Design based on query requirements
3. **Data Denormalization**: Optimize for read performance
4. **Composite Keys**: Enable flexible querying with GSIs

---

## 🗂 Main Table: `MediSecure-HealthData`

### Primary Key Structure

```
PK (Partition Key): {ENTITY_TYPE}#{ENTITY_ID}
SK (Sort Key): {SUB_ENTITY_TYPE}#{SUB_ENTITY_ID}#{TIMESTAMP}
```

### Entity Types

- **USER**: Patient and healthcare provider profiles
- **RECORD**: Medical records and consultations
- **APPOINTMENT**: Scheduling and management
- **DOCUMENT**: Medical files and reports
- **AUDIT**: Security and compliance logging

---

## 👥 User Entity Structure

### Patient Profile

```json
{
  "PK": "USER#patient_12345",
  "SK": "PROFILE#main",
  "GSI1PK": "EMAIL#john.doe@email.com",
  "GSI1SK": "USER#patient_12345",
  "entityType": "USER",
  "userType": "PATIENT",
  "cognitoUserId": "f1932d7a-8031-7015-fa2f-cccf477c6ac4",
  "personalInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@email.com",
    "phoneNumber": "+97412345678",
    "dateOfBirth": "1985-06-15",
    "gender": "M",
    "address": {
      "street": "123 Medical St",
      "city": "Doha",
      "state": "Doha",
      "country": "Qatar",
      "postalCode": "12345"
    }
  },
  "medicalInfo": {
    "bloodType": "O+",
    "allergies": ["Penicillin", "Shellfish"],
    "emergencyContact": {
      "name": "Jane Doe",
      "relationship": "Spouse",
      "phoneNumber": "+97412345679"
    },
    "insuranceProvider": "Qatar Insurance Company",
    "insuranceNumber": "QIC123456789"
  },
  "preferences": {
    "language": "en",
    "timezone": "Asia/Qatar",
    "communicationMethod": "email"
  },
  "createdAt": "2025-06-01T12:37:16.484Z",
  "updatedAt": "2025-06-01T12:37:16.484Z",
  "status": "ACTIVE"
}
```

### Healthcare Provider Profile

```json
{
  "PK": "USER#provider_98765",
  "SK": "PROFILE#main",
  "GSI1PK": "EMAIL#dr.smith@medisecure.com",
  "GSI1SK": "USER#provider_98765",
  "entityType": "USER",
  "userType": "PROVIDER",
  "cognitoUserId": "provider-cognito-id",
  "personalInfo": {
    "firstName": "Dr. Sarah",
    "lastName": "Smith",
    "email": "dr.smith@medisecure.com",
    "phoneNumber": "+97412345680"
  },
  "professionalInfo": {
    "licenseNumber": "QMD12345",
    "specialization": "Cardiology",
    "hospital": "Hamad Medical Corporation",
    "department": "Cardiac Surgery",
    "yearsOfExperience": 15
  },
  "availability": {
    "workingHours": {
      "monday": { "start": "08:00", "end": "17:00" },
      "tuesday": { "start": "08:00", "end": "17:00" },
      "wednesday": { "start": "08:00", "end": "17:00" }
    },
    "consultationFee": 200,
    "currency": "QAR"
  },
  "createdAt": "2025-06-01T12:37:16.484Z",
  "updatedAt": "2025-06-01T12:37:16.484Z",
  "status": "ACTIVE"
}
```

---

## 📋 Medical Record Entity Structure

### Medical Record

```json
{
  "PK": "USER#patient_12345",
  "SK": "RECORD#consultation_67890#2025-06-01T10:30:00Z",
  "GSI1PK": "PROVIDER#provider_98765",
  "GSI1SK": "RECORD#2025-06-01T10:30:00Z",
  "GSI2PK": "RECORD_TYPE#CONSULTATION",
  "GSI2SK": "2025-06-01T10:30:00Z",
  "entityType": "RECORD",
  "recordType": "CONSULTATION",
  "recordId": "consultation_67890",
  "patientId": "patient_12345",
  "providerId": "provider_98765",
  "appointmentId": "appointment_54321",
  "visitInfo": {
    "date": "2025-06-01T10:30:00Z",
    "type": "REGULAR_CHECKUP",
    "duration": 30,
    "location": "Hamad Medical Corporation - Room 205"
  },
  "clinicalData": {
    "chiefComplaint": "Regular cardiac checkup",
    "symptoms": ["Mild chest discomfort", "Occasional shortness of breath"],
    "vitalSigns": {
      "bloodPressure": "120/80",
      "heartRate": 72,
      "temperature": 98.6,
      "weight": 75.5,
      "height": 180
    },
    "diagnosis": [
      {
        "code": "I25.9",
        "description": "Chronic ischemic heart disease, unspecified",
        "severity": "MILD"
      }
    ],
    "treatment": {
      "prescription": [
        {
          "medication": "Atorvastatin",
          "dosage": "20mg",
          "frequency": "Once daily",
          "duration": "30 days"
        }
      ],
      "procedures": [],
      "recommendations": ["Regular exercise", "Low-sodium diet"]
    }
  },
  "followUp": {
    "required": true,
    "timeframe": "3 months",
    "notes": "Monitor cholesterol levels"
  },
  "attachments": [
    {
      "documentId": "doc_12345",
      "type": "ECG_REPORT",
      "s3Key": "documents/patient_12345/ecg_2025-06-01.pdf"
    }
  ],
  "createdAt": "2025-06-01T10:30:00Z",
  "updatedAt": "2025-06-01T10:35:00Z",
  "status": "COMPLETED"
}
```

---

## 📅 Appointment Entity Structure

### Appointment

```json
{
  "PK": "USER#patient_12345",
  "SK": "APPOINTMENT#appointment_54321#2025-06-15T14:00:00Z",
  "GSI1PK": "PROVIDER#provider_98765",
  "GSI1SK": "APPOINTMENT#2025-06-15T14:00:00Z",
  "GSI2PK": "APPOINTMENT_DATE#2025-06-15",
  "GSI2SK": "14:00:00Z#appointment_54321",
  "entityType": "APPOINTMENT",
  "appointmentId": "appointment_54321",
  "patientId": "patient_12345",
  "providerId": "provider_98765",
  "schedulingInfo": {
    "appointmentDate": "2025-06-15T14:00:00Z",
    "duration": 30,
    "type": "FOLLOW_UP",
    "location": "Hamad Medical Corporation - Room 205",
    "mode": "IN_PERSON"
  },
  "reason": "Follow-up cardiac consultation",
  "preparation": [
    "Bring previous ECG reports",
    "Fasting for 12 hours for blood work"
  ],
  "reminder": {
    "sent": false,
    "scheduledFor": "2025-06-14T14:00:00Z"
  },
  "payment": {
    "fee": 200,
    "currency": "QAR",
    "status": "PENDING",
    "method": "INSURANCE"
  },
  "createdAt": "2025-06-01T12:45:00Z",
  "updatedAt": "2025-06-01T12:45:00Z",
  "status": "SCHEDULED"
}
```

---

## 📄 Document Entity Structure

### Medical Document

```json
{
  "PK": "USER#patient_12345",
  "SK": "DOCUMENT#doc_12345#2025-06-01T10:35:00Z",
  "GSI1PK": "DOCUMENT_TYPE#ECG_REPORT",
  "GSI1SK": "2025-06-01T10:35:00Z",
  "entityType": "DOCUMENT",
  "documentId": "doc_12345",
  "patientId": "patient_12345",
  "providerId": "provider_98765",
  "recordId": "consultation_67890",
  "documentInfo": {
    "type": "ECG_REPORT",
    "title": "12-Lead ECG Report",
    "description": "Electrocardiogram performed during routine cardiac checkup",
    "category": "DIAGNOSTIC_REPORT"
  },
  "fileInfo": {
    "s3Bucket": "medisecure-documents-prod",
    "s3Key": "documents/patient_12345/ecg_2025-06-01.pdf",
    "fileName": "ecg_report_20250601.pdf",
    "fileSize": 2048576,
    "mimeType": "application/pdf",
    "checksum": "sha256:a1b2c3d4e5f6..."
  },
  "security": {
    "encryptionStatus": "ENCRYPTED",
    "accessLevel": "PATIENT_PROVIDER_ONLY",
    "retentionPeriod": "7_YEARS"
  },
  "createdAt": "2025-06-01T10:35:00Z",
  "updatedAt": "2025-06-01T10:35:00Z",
  "status": "ACTIVE"
}
```

---

## 🔍 Global Secondary Indexes (GSI)

### GSI1: Email-based User Lookup

- **PK**: Email address
- **SK**: User ID
- **Use Case**: User authentication and profile retrieval

### GSI2: Provider-based Record Queries

- **PK**: Provider ID
- **SK**: Record timestamp
- **Use Case**: Provider viewing patient records

### GSI3: Date-based Appointment Queries

- **PK**: Appointment date
- **SK**: Time and appointment ID
- **Use Case**: Daily schedule management

### GSI4: Document Type Queries

- **PK**: Document type
- **SK**: Creation timestamp
- **Use Case**: Document categorization and retrieval

---

## 🔧 Access Patterns

### Primary Access Patterns

1. **Get user profile by ID** → Query PK=USER#{userId}
2. **Get user by email** → Query GSI1 PK=EMAIL#{email}
3. **Get patient records** → Query PK=USER#{patientId}, SK begins with RECORD#
4. **Get provider's patients** → Query GSI1 PK=PROVIDER#{providerId}
5. **Get appointments by date** → Query GSI2 PK=APPOINTMENT_DATE#{date}
6. **Get documents by type** → Query GSI3 PK=DOCUMENT_TYPE#{type}

---

## 🔒 Security & Compliance

### Encryption

- **At Rest**: DynamoDB encryption enabled
- **In Transit**: TLS 1.2+ for all connections
- **Application Level**: Sensitive fields additional encryption

### Access Control

- **IAM Roles**: Least privilege principle
- **Resource-based Policies**: Fine-grained table access
- **Application-level**: Row-level security based on user context

### Audit Logging

```json
{
  "PK": "AUDIT#2025-06-01",
  "SK": "ACCESS#12:37:16.484Z#user_12345",
  "entityType": "AUDIT",
  "action": "READ_MEDICAL_RECORD",
  "userId": "patient_12345",
  "resourceId": "consultation_67890",
  "ipAddress": "192.168.1.100",
  "userAgent": "MediSecure-Web/1.0",
  "timestamp": "2025-06-01T12:37:16.484Z",
  "result": "SUCCESS"
}
```

---

## 📈 Performance Optimization

### Read Optimization

- **Query over Scan**: Use proper keys for all queries
- **Projection**: Only retrieve needed attributes
- **Consistent Reads**: Only when necessary for critical data

### Write Optimization

- **Batch Operations**: Group related writes
- **Conditional Writes**: Prevent race conditions
- **TTL**: Auto-expire temporary data (like sessions)

### Cost Optimization

- **On-Demand Billing**: For unpredictable workloads
- **Reserved Capacity**: For predictable base load
- **Compression**: Large text fields in medical records

---

_Schema designed for healthcare compliance, performance, and scalability_
_Ready for implementation with AWS CDK/Terraform_
