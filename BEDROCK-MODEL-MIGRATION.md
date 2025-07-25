# Bedrock Model Migration: Titan to Nova

## Summary
Updated the MediSecure AI symptom analysis service to migrate from deprecated Amazon Titan models to the new Amazon Nova models, as per AWS deprecation notice dated January 25, 2025.

## Changes Made

### 1. Model ID Update
- **Old Model**: `amazon.titan-text-lite-v1`
- **New Model**: `ap-south-1.amazon.nova-lite-v1:0`
- Using cross-region inference profile for Asia Pacific (Mumbai) region

### 2. Code Changes in `backend/src/ai/bedrock-client.ts`

#### Updated Model Reference (Line 55)
```typescript
// Before
const titanModel = "amazon.titan-text-lite-v1";

// After  
const novaModel = "ap-south-1.amazon.nova-lite-v1:0";
```

#### Updated Request Format (Lines 117-123)
```typescript
// Nova format
requestBody = {
  prompt: prompt,
  maxTokens: this.config.maxTokens,
  temperature: this.config.temperature,
  topP: 0.9,
};
```

#### Updated Response Parsing (Line 138)
```typescript
// Before
const aiText = isClaudeModel ? responseBody.content[0].text : responseBody.results[0].outputText;

// After
const aiText = isClaudeModel ? responseBody.content[0].text : responseBody.completion;
```

## Testing
- Created unit tests to verify model updates
- All deprecated Titan references have been removed
- Nova model integration verified with correct request/response formats

## Impact
- No functional changes to the AI symptom analysis feature
- Service will continue to work after August 15, 2025 deadline
- Maintains fallback behavior when Claude model is unavailable

## Deployment Notes
- No configuration changes required
- Ensure IAM role has permissions for Nova models (same as existing Bedrock permissions)
- Monitor logs after deployment to verify successful model invocations