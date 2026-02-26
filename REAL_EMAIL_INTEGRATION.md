# Real Email Integration Guide

This guide shows how to integrate the Inventory Management System with real email services.

## 📧 Current Implementation

The email service is now using **real API calls** to simulate email sending. Currently using:

- **Mock API**: `https://jsonplaceholder.typicode.com/posts`
- **Real structure**: Proper email headers and JSON payloads
- **Console logging**: All email activity is logged for verification

## 🚀 How to Connect to Real Email Services

### Option 1: SendGrid Integration

1. **Install SendGrid package**:

```bash
npm install @sendgrid/mail
```

2. **Update emailService.js**:

```javascript
import sgMail from "@sendgrid/mail";

// Replace the fetch calls with SendGrid
const sendRequestNotification = async (request) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: emailService.hrManagerEmails,
    from: "noreply@company.com",
    subject: "New Item Request Submitted",
    text: emailService.formatRequestEmail(request, "request").body,
  };

  try {
    await sgMail.send(msg);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("SendGrid error:", error);
    return { success: false, message: "Failed to send email" };
  }
};
```

3. **Environment Variables**:

```env
SENDGRID_API_KEY=your_sendgrid_api_key_here
```

### Option 2: Nodemailer with SMTP

1. **Install Nodemailer**:

```bash
npm install nodemailer
```

2. **Create email transporter**:

```javascript
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransporter({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendRequestNotification = async (request) => {
  const mailOptions = {
    from: "noreply@company.com",
    to: emailService.hrManagerEmails.join(","),
    subject: "New Item Request Submitted",
    text: emailService.formatRequestEmail(request, "request").body,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("SMTP error:", error);
    return { success: false, message: "Failed to send email" };
  }
};
```

3. **Environment Variables**:

```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Option 3: AWS SES Integration

1. **Install AWS SDK**:

```bash
npm install aws-sdk
```

2. **Configure SES**:

```javascript
import AWS from "aws-sdk";

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "us-east-1",
});

const ses = new AWS.SES();

const sendRequestNotification = async (request) => {
  const params = {
    Source: "noreply@company.com",
    Destination: {
      ToAddresses: emailService.hrManagerEmails,
    },
    Message: {
      Subject: {
        Data: "New Item Request Submitted",
      },
      Body: {
        Text: {
          Data: emailService.formatRequestEmail(request, "request").body,
        },
      },
    },
  };

  try {
    await ses.sendEmail(params).promise();
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("SES error:", error);
    return { success: false, message: "Failed to send email" };
  }
};
```

3. **Environment Variables**:

```env
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
```

### Option 4: Mailgun Integration

1. **Install Mailgun package**:

```bash
npm install mailgun-js
```

2. **Configure Mailgun**:

```javascript
import formData from "form-data";
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
});

const sendRequestNotification = async (request) => {
  const data = {
    from: "noreply@company.com",
    to: emailService.hrManagerEmails,
    subject: "New Item Request Submitted",
    text: emailService.formatRequestEmail(request, "request").body,
  };

  try {
    await mg.messages.create(process.env.MAILGUN_DOMAIN, data);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Mailgun error:", error);
    return { success: false, message: "Failed to send email" };
  }
};
```

3. **Environment Variables**:

```env
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain
```

## 🔧 Environment Setup

### Create `.env` file in project root:

```env
# Choose one email service:

# SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key

# OR Nodemailer
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# OR AWS SES
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# OR Mailgun
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain

# Common settings
NODE_ENV=production
```

## 📋 Email Service Comparison

| Service        | Cost                | Setup  | Features           | Best For    |
| -------------- | ------------------- | ------ | ------------------ | ----------- |
| **SendGrid**   | Free tier available | Easy   | Advanced features  | Enterprise  |
| **Nodemailer** | Free                | Medium | Flexible           | Custom SMTP |
| **AWS SES**    | Very cheap          | Medium | AWS integration    | AWS users   |
| **Mailgun**    | Free tier           | Easy   | Developer-friendly | Startups    |

## 🧪 Testing Real Emails

1. **Update email addresses** in `emailService.js`:

```javascript
hrManagerEmails: [
  'your-email@gmail.com',  // Replace with real email
  'another-email@company.com'
],
```

2. **Submit a test request** through the application
3. **Check your inbox** for the notification email
4. **Verify console logs** for success/failure messages

## 🔒 Security Best Practices

1. **Use environment variables** for API keys
2. **Enable 2FA** for email accounts
3. **Use app-specific passwords** for Gmail
4. **Monitor email usage** and set limits
5. **Validate email addresses** before sending
6. **Handle errors gracefully** with proper logging

## 🚨 Troubleshooting

### Common Issues:

1. **Email not sent**:
   - Check API keys in environment variables
   - Verify email addresses are valid
   - Check service-specific quotas and limits

2. **Authentication errors**:
   - Verify credentials are correct
   - Check if 2FA is required
   - Use app-specific passwords for Gmail

3. **Rate limiting**:
   - Implement retry logic
   - Add delays between emails
   - Monitor service usage

4. **Emails in spam**:
   - Verify domain with email service
   - Use proper sender addresses
   - Avoid spam trigger words

## 📈 Production Deployment

1. **Set environment variables** on your hosting platform
2. **Choose appropriate email service** based on volume
3. **Monitor email delivery** and open rates
4. **Set up email templates** for better branding
5. **Implement email tracking** for analytics

The email service is now ready for real email integration! 🎉
