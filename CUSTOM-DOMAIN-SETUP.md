# Custom Domain Setup for MediSecure Platform

## 🎯 Setting up `healthcare.talharesume.com`

Your MediSecure platform will be available at: **`https://healthcare.talharesume.com`**

## 📋 Prerequisites

1. **Access to DNS management** for `talharesume.com`
2. **AWS CLI configured** with appropriate permissions
3. **Route53 Hosted Zone** (optional - can be auto-created)

## 🚀 Deployment Steps

### Step 1: Deploy with Custom Domain

```bash
cd infrastructure/cdk

# Deploy the custom domain stack
npx cdk deploy MediSecureCustomDomain --app "npx ts-node cdk-custom-domain.ts"
```

### Step 2: DNS Configuration with Namecheap.com

After deployment, you'll need to add DNS records to your `talharesume.com` domain in Namecheap:

**Namecheap DNS Setup Steps:**

1. **Login to Namecheap** → Go to [namecheap.com](https://namecheap.com) and sign in
2. **Domain List** → Click "Manage" next to `talharesume.com`
3. **Advanced DNS** → Click the "Advanced DNS" tab
4. **Add Record** → Click "Add New Record"

**DNS Record to Add:**

```
Type: CNAME Record
Host: healthcare
Value: d1aaifqtlfz7l5.cloudfront.net
TTL: 300 (5 minutes) or Automatic
```

⚠️ **Important**: Do NOT include `https://` in the Value field - just the domain name!

**Example after deployment:**

```
Type: CNAME Record
Host: healthcare
Value: d1aaifqtlfz7l5.cloudfront.net
TTL: 300
```

**SSL Certificate DNS Validation:**
AWS will also provide DNS validation records that look like this:

```
Type: CNAME Record
Host: _acme-challenge.healthcare
Value: [AWS Certificate Manager validation string]
TTL: 300
```

### Step 3: SSL Certificate Validation

1. AWS will automatically create an SSL certificate for `healthcare.talharesume.com`
2. You'll receive DNS validation records to add to your domain
3. Once validated, your site will be live with HTTPS

## 🔧 Alternative Subdomains

You can easily change the subdomain by modifying `cdk-custom-domain.ts`:

```typescript
subdomain: 'healthcare', // → healthcare.talharesume.com (CURRENT)
subdomain: 'medisecure',  // → medisecure.talharesume.com
subdomain: 'portfolio',   // → portfolio.talharesume.com
subdomain: 'demo',        // → demo.talharesume.com
```

## 📊 Expected Results

✅ **Before**: `https://d1aaifqtlfz7l5.cloudfront.net`
✅ **After**: `https://healthcare.talharesume.com`

## ⚡ Quick Deploy (Current CloudFront)

If you want to keep the current CloudFront URL for now:

```bash
# Continue using current setup
npx cdk deploy ProductionHostingStack
```

## 🛠️ Troubleshooting

**Certificate Issues**: Ensure certificate is created in `us-east-1` region
**DNS Issues**: DNS propagation can take 24-48 hours
**Route53 Issues**: Check hosted zone configuration

---

**Ready to proceed?** Let me know if you want to:

1. ✅ **Deploy with custom domain** → Run the commands above
2. ✅ **Keep current CloudFront URL** → Continue as-is
3. ✅ **Choose different subdomain** → Modify the configuration
