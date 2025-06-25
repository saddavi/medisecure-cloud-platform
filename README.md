# 🏥 MediSecure Cloud Platform

> A secure, HIPAA-ready healthcare platform built on AWS with full-stack integration

[![Status](https://img.shields.io/badge/Status-100%25%20Complete-brightgreen)]()
[![Cost](https://img.shields.io/badge/Cost-$0.00-success)]()
[![AWS](https://img.shields.io/badge/AWS-Production%20Live-orange)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)]()
[![AWS](https://img.shields.io/badge/AWS-Multi--Region-ff9900)]()

## 🚀 Live Demo

**🌐 Custom Domain**: [https://healthcare.talharesume.com](https://healthcare.talharesume.com) ✅ **LIVE WITH SSL** 🔒  
**📡 CloudFront URL**: [https://d1aaifqtlfz7l5.cloudfront.net](https://d1aaifqtlfz7l5.cloudfront.net) ✅ **LIVE**  
**💻 Development Server**: [http://localhost:3000](http://localhost:3000)  
**🔑 Test Credentials**: `test@medisecure.dev` / `TempPass123!`

📋 **[Complete Testing Guide](TESTING-GUIDE.md)** - What visitors can test and explore

## 📋 Overview

MediSecure Cloud addresses healthcare coordination challenges in Qatar and the Middle East, providing a comprehensive platform for:

- **Patient Management** - Secure medical records with AWS Cognito authentication
- **Healthcare Provider Dashboard** - Real-time patient queue management
- **HIPAA Compliance** - Security-first architecture with proper encryption
- **Multi-Region Architecture** - Optimized for Gulf region performance

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────┐
│              MediSecure Cloud Platform              │
│     (Production AWS Multi-Region + AI-Powered)      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Frontend (React + TypeScript)                     │
│  ├── Production: CloudFront CDN                     │
│  ├── S3 Static Hosting (encrypted)                  │
│  ├── AI Symptom Checker (Bilingual)                 │
│  └── Development: localhost:3000                    │
│                                                     │
│  ┌─────────────┐    me-south-1 (Bahrain)           │
│  │ API Gateway │ ── JWT Token Validation            │
│  │   + CORS    │ ── Healthcare API Endpoints        │
│  │            │ ── AI Symptom Analysis              │
│  └─────────────┘                                    │
│         │                                           │
│         ▼                                           │
│  ┌─────────────┐    me-south-1 (Bahrain)           │
│  │   Lambda    │ ── Patient CRUD Operations         │
│  │ Functions   │ ── Authentication Handlers         │
│  │   Node.js   │ ── HIPAA-Compliant Processing      │
│  │            │ ── AI Symptom Analysis              │
│  └─────────────┘                                    │
│         │                                           │
│         ▼                                           │
│  ┌─────────────┬─────────────┬─────────────┐       │
│  │  DynamoDB   │   Cognito   │   Bedrock   │       │
│  │ (Bahrain)   │  (Mumbai)   │  (Mumbai)   │       │
│  │ • Patients  │ • JWT Auth  │ • Claude AI │       │
│  │ • Sessions  │ • MFA Ready │ • AR/EN NLP │       │
│  └─────────────┴─────────────┴─────────────┘       │
└─────────────────────────────────────────────────────┘
```

## 🎯 Current Status

### ✅ Phase 7 Complete - AI-Powered Symptom Checker

| Component            | Status        | Function                   | Region     |
| -------------------- | ------------- | -------------------------- | ---------- |
| **Custom Domain**    | ✅ LIVE       | healthcare.talharesume.com | Global     |
| **SSL Certificate**  | ✅ Active     | AWS Certificate Manager    | us-east-1  |
| **React Frontend**   | ✅ LIVE       | Production CloudFront CDN  | Global     |
| **S3 Hosting**       | ✅ Active     | Static website (encrypted) | us-east-1  |
| **AWS Amplify**      | ✅ Integrated | Authentication service     | Configured |
| **AWS Cognito**      | ✅ Active     | JWT token management       | ap-south-1 |
| **API Gateway**      | ✅ Active     | Secured REST endpoints     | me-south-1 |
| **Lambda Functions** | ✅ Deployed   | Patient, auth & AI handlers| me-south-1 |
| **DynamoDB**         | ✅ Active     | Patient data with GSI      | me-south-1 |
| **CloudFront**       | ✅ Active     | Global CDN + security      | Global     |
| **AWS Bedrock**      | ✅ Active     | AI symptom analysis        | ap-south-1 |
| **AI Features**      | ✅ LIVE       | Bilingual (AR/EN) analysis | Global     |

### 🔧 Deployed Lambda Functions

- **MediSecurePatientFunction** - Patient CRUD operations
- **MediSecure-UserRegistration** - User registration handler
- **MediSecure-UserLogin** - Authentication handler
- **MediSecure-AI-SymptomAnalysis** - AI-powered symptom checker (NEW)

## 🚀 Try it Now (2 minutes)

### Option 1: Live Production Site ⚡

```bash
# 🌐 Custom Domain: https://healthcare.talharesume.com
# 📡 CloudFront: https://d1aaifqtlfz7l5.cloudfront.net
# 🔑 Login: test@medisecure.dev / TempPass123!
# ✅ SSL Certificate & Professional Domain
```

### 🤖 AI Symptom Checker (NEW) ⚡

```bash
# Live AI API Endpoint (Bilingual: Arabic/English)
curl -X POST https://pbfnwg7ty4.execute-api.me-south-1.amazonaws.com/prod/public/symptom-check \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": {
      "description": "I have a severe headache and feel dizzy",
      "severity": 8,
      "duration": "2 hours"
    },
    "language": "en"
  }'

# Arabic Example:
# "symptoms": {"description": "صداع شديد ودوخة", "severity": 8}, "language": "ar"
```

### Option 2: Local Development

```bash
git clone https://github.com/saddavi/medisecure-cloud-platform.git
cd medisecure-cloud-platform/frontend
npm install && npm run dev
# ✅ Open http://localhost:3000
# ✅ Login: test@medisecure.dev / TempPass123!
```

### Option 3: Deploy Your Own

```bash
# Deploy production infrastructure
cd infrastructure/cdk
npm install && npm run build
cdk deploy MediSecure-Hosting --require-approval never
```

### 🤖 AI Symptom Checker Demo

```bash
# Test English symptoms
curl -X POST https://pbfnwg7ty4.execute-api.me-south-1.amazonaws.com/prod/public/symptom-check \
  -H "Content-Type: application/json" \
  -d '{"symptoms": {"description": "chest pain and difficulty breathing", "severity": 9}, "language": "en"}'

# Test Arabic symptoms  
curl -X POST https://pbfnwg7ty4.execute-api.me-south-1.amazonaws.com/prod/public/symptom-check \
  -H "Content-Type: application/json" \
  -d '{"symptoms": {"description": "صداع شديد وغثيان", "severity": 7}, "language": "ar"}'
```

## 📁 Project Structure

```
medisecure-cloud-platform/
├── frontend/               # React application (✅ Complete)
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Application routes
│   │   ├── services/       # API layer
│   │   └── types/          # TypeScript definitions
│   └── package.json
├── backend/                # Serverless functions
│   ├── src/
│   │   ├── auth/           # Authentication handlers
│   │   ├── patient/        # Patient management
│   │   └── utils/          # Shared utilities
│   └── dist/               # Compiled output
├── infrastructure/         # AWS CDK
│   └── cdk/                # Infrastructure as Code
└── docs/                   # Documentation
    ├── session-reports/    # Progress tracking
    └── technical-specs/    # Setup guides
```

## 💡 Key Features

### 🤖 AI-Powered Health Assistant (NEW)

- **Live API**: Real-time symptom analysis via AWS Bedrock
- **Bilingual Support**: Native Arabic and English processing
- **Smart Triage**: Automated severity assessment (Low/Medium/High/Emergency)
- **Model Resilience**: Claude 3 Haiku (primary) + Amazon Titan (fallback)
- **Anonymous Access**: Public health education without registration
- **Qatar-Optimized**: Mumbai region deployment for optimal Gulf latency

### 🔐 Security & Compliance

- HIPAA-ready architecture with end-to-end encryption
- Multi-factor authentication via AWS Cognito
- Role-based access control (Patient/Doctor/Admin)
- Audit logging and data encryption

### 📱 Patient Portal

- Secure authentication with biometric support
- Medical history and test results access
- Appointment booking and management
- Emergency contact integration
- AI symptom checker integration

### 👩‍⚕️ Healthcare Provider Dashboard

- Real-time patient queue management
- Digital consultation notes
- Lab test ordering system
- Vital signs monitoring
- AI-assisted diagnosis suggestions

## 🛠️ Technology Stack

**Frontend**

- React 18 + TypeScript
- Tailwind CSS for styling
- AWS Amplify for authentication
- React Query for API caching

**Backend**

- AWS Lambda (Node.js 20.x)
- DynamoDB (single-table design)
- API Gateway with CORS
- AWS Cognito for auth
- AWS Bedrock AI (Claude 3 Haiku + Titan fallback)

**Infrastructure**

- AWS CDK (TypeScript)
- CloudFront CDN (global)
- S3 static hosting
- Multi-region deployment
- CloudWatch monitoring
- AI optimized for <$1/month cost

## 📈 Development Roadmap

### Completed Phases ✅

- **Phase 1** - AWS foundation (Cognito, Lambda, API Gateway)
- **Phase 2** - DynamoDB patient management with multi-region setup
- **Phase 3** - React frontend with modern healthcare UI/UX
- **Phase 4** - Full-stack integration with authentication flow
- **Phase 5** - Production deployment with CloudFront CDN
- **Phase 6** - Custom domain & SSL certificate setup
- **Phase 7** - AI-powered symptom checker with AWS Bedrock

### Next Phase 🚧

- **Phase 8** - IoT integration for real-time vital signs monitoring
- **Phase 9** - Mobile app development (React Native)
- **Phase 10** - Analytics dashboard with QuickSight

## 💰 Cost Optimization Results

### Current Costs: $0.00 (100% Free Tier) ✅

| Service     | Free Tier Limit      | Our Usage          | Cost  |
| ----------- | -------------------- | ------------------ | ----- |
| Lambda      | 1M requests/month    | ~2K requests       | $0.00 |
| API Gateway | 1M calls/month       | ~100 calls         | $0.00 |
| DynamoDB    | 25GB + 200M requests | ~1MB + 50 requests | $0.00 |
| Cognito     | 50K active users     | ~5 test users      | $0.00 |
| CloudFront  | 1TB data transfer    | ~1GB usage         | $0.00 |
| S3          | 5GB storage          | ~100MB usage       | $0.00 |

**Production Estimate**: $50-200/month for 1000+ patients

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 📞 Contact

**Developer**: Talha Nasiruddin  
**Email**: talhanasiruddin@outlook.com  
**LinkedIn**: [linkedin.com/in/talhanasiruddin](https://www.linkedin.com/in/talhanasiruddin/)  
**Repository**: [github.com/saddavi/medisecure-cloud-platform](https://github.com/saddavi/medisecure-cloud-platform)

---

> _"Technology should make healthcare more human, not less human."_  
> Building solutions for Qatar's healthcare future 🇶🇦
