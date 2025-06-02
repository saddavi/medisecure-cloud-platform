# MediSecure Cloud Platform - Learning Quiz

## Session: May 31, 2025 - API Gateway & Authentication Deep Dive

### Instructions:

- Answer all 10 questions based on today's session
- Mix of multiple choice, short answer, and practical questions
- Focus on key concepts: SECRET_HASH, Lambda integration, CORS, Cognito
- Review your answers against the SESSION-REPORT-MAY-31-2025.md

---

## Question 1: SECRET_HASH Fundamentals (Multiple Choice)

**What is the PRIMARY purpose of SECRET_HASH in AWS Cognito authentication?**

A) To encrypt user passwords in the database
B) To provide additional security when using Cognito User Pool client secrets
C) To generate random session tokens
D) To validate email addresses during registration

_Difficulty: Medium_
_Concept: Cognito Security_

---

## Question 2: HMAC Implementation (Short Answer)

**Complete this code snippet for generating SECRET_HASH:**

```typescript
import crypto from "crypto";

function generateSecretHash(
  username: string,
  clientId: string,
  clientSecret: string
): string {
  return crypto
    .createHmac("______", clientSecret)
    .update(________)
    .digest("______");
}
```

Fill in the three blanks with the correct values.

_Difficulty: Medium_
_Concept: Cryptographic Implementation_

---

## Question 3: Error Analysis (Multiple Choice)

**When we encountered "502 Bad Gateway" errors, what was the PRIMARY root cause?**

A) CORS configuration was incorrect
B) Lambda function timeout
C) Missing SECRET_HASH in Cognito operations
D) Invalid API Gateway endpoint configuration

_Difficulty: Easy_
_Concept: Troubleshooting_

---

## Question 4: Lambda Environment Variables (Practical)

**Write the AWS CLI command to update a Lambda function's environment variables with COGNITO_CLIENT_SECRET:**

```bash
aws lambda update-function-configuration \
  --function-name ________________ \
  --environment Variables='{________________}'
```

_Difficulty: Medium_
_Concept: Lambda Configuration_

---

## Question 5: Cognito Operations (Multiple Choice)

**Which Cognito operations in our implementation require SECRET_HASH? (Select all that apply)**

A) SignUpCommand
B) InitiateAuthCommand  
C) ConfirmForgotPasswordCommand
D) DescribeUserPoolCommand
E) ListUsersCommand

_Difficulty: Medium_
_Concept: Cognito API_

---

## Question 6: Custom Attributes Problem (Short Answer)

**Explain why we removed the custom attributes (custom:accepted_terms, custom:accepted_privacy, custom:registration_timestamp) from our SignUpCommand:**

_Your Answer:_

---

---

---

_Difficulty: Medium_
_Concept: Cognito User Attributes_

---

## Question 7: API Gateway Testing (Practical)

**Write a curl command to test our registration endpoint with proper headers:**

```bash
curl -X POST \
  ________________ \
  -H "________________" \
  -H "________________" \
  -d '________________'
```

_Difficulty: Medium_
_Concept: API Testing_

---

## Question 8: Architecture Decision (Short Answer)

**List 3 advantages of using API Gateway with Lambda for our authentication system instead of direct Lambda invocation:**

1. ***
2. ***
3. ***

_Difficulty: Medium_
_Concept: Architecture Design_

---

## Question 9: Security Best Practices (Multiple Choice)

**According to AWS best practices, how should we handle the COGNITO_CLIENT_SECRET in production?**

A) Store it directly in the Lambda function code
B) Use AWS Systems Manager Parameter Store with encryption
C) Pass it as a query parameter in API calls
D) Store it in a public S3 bucket

_Difficulty: Easy_
_Concept: Security_

---

## Question 10: Next Steps Planning (Essay)

**Based on today's session, outline the 3 most important next steps for our MediSecure platform and explain why each is critical for the project's success:**

_Your Answer:_

---

---

---

---

---

---

_Difficulty: Hard_
_Concept: Project Planning_

---

## Answer Key

### Question 1: B) To provide additional security when using Cognito User Pool client secrets

_Explanation: SECRET_HASH adds an extra layer of security when the client secret is configured, preventing unauthorized access even if the client ID is compromised._

### Question 2:

- Blank 1: `'sha256'`
- Blank 2: `username + clientId`
- Blank 3: `'base64'`

### Question 3: C) Missing SECRET_HASH in Cognito operations

_Explanation: The 502 errors were caused by Cognito rejecting our requests due to missing SECRET_HASH when client secret was configured._

### Question 4:

```bash
aws lambda update-function-configuration \
  --function-name MediSecure-UserRegistration \
  --environment Variables='{"COGNITO_CLIENT_SECRET":"your-secret-here"}'
```

### Question 5: A, B, C (SignUpCommand, InitiateAuthCommand, ConfirmForgotPasswordCommand)

_Explanation: Operations that modify or authenticate users require SECRET_HASH, while read-only operations typically don't._

### Question 6:

_Sample Answer: Custom attributes were causing InvalidParameterException because they weren't properly defined in the User Pool schema. Cognito requires custom attributes to be pre-configured in the User Pool before they can be used in SignUp operations._

### Question 7:

```bash
curl -X POST \
  https://e8x7hxtrul.execute-api.ap-south-1.amazonaws.com/dev/auth/register \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"email":"test@example.com","password":"TempPass123!","firstName":"Test","lastName":"User"}'
```

### Question 8:

_Sample Answers:_

1. _Built-in CORS handling and request/response transformation_
2. _Automatic scaling and load balancing_
3. _Request validation, rate limiting, and monitoring capabilities_

### Question 9: B) Use AWS Systems Manager Parameter Store with encryption

_Explanation: Parameter Store provides secure, encrypted storage for sensitive configuration data with proper access controls._

### Question 10:

_Sample Answer should include:_

1. _Login endpoint testing and frontend integration_
2. _Database setup for patient records and medical data_
3. _Production security hardening and compliance measures_

---

## Performance Scoring:

- **8-10 correct:** Excellent understanding - Ready for advanced topics
- **6-7 correct:** Good grasp - Review missed concepts before continuing
- **4-5 correct:** Basic understanding - Need focused review session
- **0-3 correct:** Requires comprehensive review of session materials

## Study Resources:

- `SESSION-REPORT-MAY-31-2025.md` - Complete technical reference
- `backend/src/utils/cognito.ts` - Implementation examples
- AWS Cognito Documentation - Deep dive into concepts
- Session chat logs - Step-by-step problem solving approach
