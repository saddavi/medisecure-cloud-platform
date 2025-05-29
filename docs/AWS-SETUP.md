# 🔧 AWS Setup Guide for MediSecure Cloud Platform

This guide helps you set up AWS access for the MediSecure Cloud Platform development.

## 🚀 Quick Setup (5 minutes)

### 1. **AWS Account Setup**
- Ensure you have an AWS account
- Install AWS CLI: `brew install awscli` (macOS)
- Configure AWS CLI: `aws configure`

### 2. **Project Configuration**
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/medisecure-cloud-platform.git
cd medisecure-cloud-platform

# Copy the environment template
cp .env.aws.template .env.aws

# Edit with your AWS details
nano .env.aws
```

### 3. **Set Your Region**
We recommend **Mumbai (ap-south-1)** for Middle East users:
```bash
aws configure set region ap-south-1
```

### 4. **Quick Access Setup**
```bash
# Make setup script executable
chmod +x scripts/aws-setup.sh

# Run the setup
./scripts/aws-setup.sh
```

## 🌍 **Recommended Regions for Qatar/Middle East**

1. **Mumbai (ap-south-1)** ⭐ **RECOMMENDED**
   - Closest available region (~2,400 km from Doha)
   - All AWS services available
   - Great latency for Middle East

2. **Frankfurt (eu-central-1)**
   - European region (~4,600 km from Doha)
   - GDPR compliance if needed

## 🔒 **Security Notes**

- ⚠️ **NEVER** commit `.env.aws` to version control
- ✅ Always use `.env.aws.template` for sharing
- 🔐 Keep AWS credentials secure and private
- 🔄 Rotate access keys regularly

## 📖 **Available Quick Commands**

After setup, you'll have these commands:
```bash
aws-medisecure    # Check AWS connection
aws-console       # Open AWS Console in browser
aws-lambda        # Open Lambda console
aws-cognito       # Open Cognito console
```

## 🆘 **Troubleshooting**

### Common Issues:
1. **"Access Denied"**: Check AWS credentials
2. **"Region not available"**: Use Mumbai (ap-south-1)
3. **"Command not found"**: Run `source ~/.zshrc`

### Reset Everything:
```bash
./scripts/aws-setup.sh
```

## 🏥 **Healthcare Compliance Notes**

For production deployment in Qatar:
- Consider data residency requirements
- Enable CloudTrail for audit logging
- Use KMS for encryption
- Follow HIPAA guidelines for healthcare data

---

**Project**: MediSecure Cloud Platform  
**Target**: Qatar & Middle East Healthcare  
**Region**: Asia Pacific (Mumbai) - ap-south-1
