# 🚀 AWS S3 Setup for Image Uploads

## ❌ **Current Issue**
Image uploads work on localhost but fail on Vercel deployment because AWS credentials are not configured in production.

## ✅ **Solution Options**

### **Option 1: Configure AWS S3 (Recommended for Production)**

#### **Step 1: Create AWS S3 Bucket**
1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Create a new bucket named `aasta-notifications` (or similar)
3. Set region to `ap-south-1` (Mumbai)
4. Enable public read access for uploaded images

#### **Step 2: Create IAM User**
1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Create new user: `aasta-s3-uploader`
3. Attach policy with S3 permissions:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::aasta-notifications",
                "arn:aws:s3:::aasta-notifications/*"
            ]
        }
    ]
}
```

#### **Step 3: Add Environment Variables to Vercel**
In your Vercel dashboard, add these environment variables:

```bash
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_S3_BUCKET_NAME=aasta-notifications
AWS_REGION=ap-south-1
```

### **Option 2: Use Vercel Blob Storage (Alternative)**

If you prefer not to use AWS, you can use Vercel's built-in blob storage:

1. Install Vercel Blob: `pnpm add @vercel/blob`
2. Get API key from Vercel dashboard
3. Update the upload API to use Vercel Blob

### **Option 3: Enhanced Base64 Fallback (Current)**

The current system already has a base64 fallback, but let me improve it for better production experience.

## 🔧 **Immediate Fix**

Let me update the upload API to provide better error handling and fallback:

```typescript
// Enhanced fallback with better error messages
if (!hasAwsCredentials || !s3Client || !BUCKET_NAME) {
  console.log('AWS S3 credentials not configured, using base64 fallback');
  
  // Convert file to base64 for immediate use
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString('base64');
  const dataUrl = `data:${file.type};base64,${base64}`;
  
  return NextResponse.json({ 
    success: true, 
    url: dataUrl,
    filename: filename,
    key: `base64-${filename}`,
    message: 'Using base64 storage (AWS S3 not configured)',
    warning: 'Images will be embedded in notifications. Consider setting up AWS S3 for better performance.'
  });
}
```

## 📊 **Comparison**

| Method | Pros | Cons | Best For |
|--------|------|------|----------|
| **AWS S3** | ✅ Scalable, ✅ CDN, ✅ Clean URLs | ❌ Setup required | Production |
| **Vercel Blob** | ✅ Easy setup, ✅ Integrated | ❌ Vendor lock-in | Quick deployment |
| **Base64** | ✅ No setup, ✅ Works immediately | ❌ Large payloads, ❌ No CDN | Development/Testing |

## 🎯 **Recommendation**

For production, I recommend **Option 1 (AWS S3)** because:
- ✅ **Scalable** - handles any number of images
- ✅ **Fast** - CDN delivery
- ✅ **Clean URLs** - professional appearance
- ✅ **Cost-effective** - pay only for what you use
- ✅ **Reliable** - AWS infrastructure

## 🚀 **Next Steps**

1. **Immediate**: The base64 fallback will work for now
2. **Production**: Set up AWS S3 for better performance
3. **Monitoring**: Add logging to track upload success rates

Would you like me to:
1. **Set up AWS S3 integration** (recommended)
2. **Improve the base64 fallback** (quick fix)
3. **Implement Vercel Blob** (alternative)
