# 🌐 Namecheap DNS Setup for healthcare.talharesume.com

## ☕ Quick Setup Guide (2 minutes)

### Step 1: Login to Namecheap

1. Go to **[namecheap.com](https://namecheap.com)** and sign in
2. Click **"Domain List"** in your account dashboard
3. Find **"talharesume.com"** and click **"Manage"**

### Step 2: Access DNS Settings

1. Click the **"Advanced DNS"** tab
2. You'll see your current DNS records

### Step 3: Add Healthcare Subdomain

Click **"Add New Record"** and add:

```
Type: CNAME Record
Host: healthcare
Value: d1aaifqtlfz7l5.cloudfront.net
TTL: 300
```

### Step 4: Add SSL Certificate Validation (After Deployment)

AWS will give you a validation record like this:

```
Type: CNAME Record
Host: _acme-challenge.healthcare
Value: [AWS will provide this string]
TTL: 300
```

## 📋 What You'll See in Namecheap

**Before Adding Records:**

```
Host: @         Type: A         Value: [your website IP]
Host: www       Type: CNAME     Value: talharesume.com
```

**After Adding Records:**

```
Host: @                          Type: A         Value: [your website IP]
Host: www                        Type: CNAME     Value: talharesume.com
Host: healthcare                 Type: CNAME     Value: d1aaifqtlfz7l5.cloudfront.net
Host: _acme-challenge.healthcare Type: CNAME     Value: [AWS validation]
```

## ⏱️ Timeline

- **DNS Propagation**: 5-30 minutes
- **SSL Certificate**: 5-10 minutes after DNS validation
- **Total Setup Time**: 15-40 minutes

## ✅ Testing

Once DNS propagates, test:

- `https://healthcare.talharesume.com` should show your MediSecure platform
- SSL certificate should be valid and secure

---

**Need help?** The AWS deployment will provide the exact values to use!
