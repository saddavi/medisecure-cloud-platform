# SSL Certificate DNS Validation Setup Guide

## 🎯 Overview

SSL certificate for `healthcare.talharesume.com` has been created successfully!
**Certificate ARN**: `arn:aws:acm:us-east-1:044519418263:certificate/7283ce0f-1d2c-43c6-adf1-786f31cc6dc2`

## 📋 DNS Records to Add in Namecheap

You need to add **2 CNAME records** to your Namecheap DNS settings for `talharesume.com`:

### Record 1: healthcare.talharesume.com validation

```
Type: CNAME
Host: _3a6800305247dbe7915bcee4b95d44b5.healthcare
Value: _5abdd24e366878d1b1df8e04b51d3b72.xlfgrmvvlj.acm-validations.aws
TTL: Automatic (or 300 seconds)
```

### Record 2: www.healthcare.talharesume.com validation

```
Type: CNAME
Host: _baa3e04f0621ca997aca0394426d17df.www.healthcare
Value: _08f37e17cf8db35d7f4a72bd7d928501.xlfgrmvvlj.acm-validations.aws
TTL: Automatic (or 300 seconds)
```

## 🔧 Step-by-Step Instructions

### Step 1: Access Namecheap DNS Settings

1. Log into your Namecheap account
2. Go to Domain List → talharesume.com → Manage
3. Click on "Advanced DNS" tab

### Step 2: Add First CNAME Record

1. Click "Add New Record"
2. Type: Select "CNAME Record"
3. Host: `_3a6800305247dbe7915bcee4b95d44b5.healthcare`
4. Value: `_5abdd24e366878d1b1df8e04b51d3b72.xlfgrmvvlj.acm-validations.aws`
5. TTL: Automatic
6. Click "Save Changes"

### Step 3: Add Second CNAME Record

1. Click "Add New Record" again
2. Type: Select "CNAME Record"
3. Host: `_baa3e04f0621ca997aca0394426d17df.www.healthcare`
4. Value: `_08f37e17cf8db35d7f4a72bd7d928501.xlfgrmvvlj.acm-validations.aws`
5. TTL: Automatic
6. Click "Save Changes"

## ⏱️ Timeline

- **DNS Propagation**: 5-30 minutes
- **Certificate Validation**: 5-15 minutes after DNS propagation
- **Total Time**: Usually 10-45 minutes

## ✅ Verification Commands

After adding DNS records, you can verify with:

```bash
# Check if DNS records are propagated
dig _3a6800305247dbe7915bcee4b95d44b5.healthcare.talharesume.com CNAME
dig _baa3e04f0621ca997aca0394426d17df.www.healthcare.talharesume.com CNAME

# Check certificate status
aws acm describe-certificate --certificate-arn "arn:aws:acm:us-east-1:044519418263:certificate/7283ce0f-1d2c-43c6-adf1-786f31cc6dc2" --region us-east-1 --query 'Certificate.Status'
```

## 🎯 Next Steps

Once certificate is validated (Status: "ISSUED"), I will:

1. Update CloudFront distribution `E15ZHMQNABZTK7`
2. Add `healthcare.talharesume.com` to aliases
3. Configure the SSL certificate
4. Complete custom domain setup

## 📞 Support

If you encounter issues, check:

- DNS record format is exactly as specified
- No extra spaces in Host/Value fields
- Records are saved successfully in Namecheap
- Allow 30 minutes for full propagation

---

**Status**: ⏳ Waiting for DNS validation records to be added
**Cost**: $0.00 (SSL certificate is completely free)
