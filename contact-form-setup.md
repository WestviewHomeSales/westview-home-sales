# Contact Form Setup and Testing Guide

This guide explains how to configure and test the contact form functionality for the Westview Home Sales website.

## Understanding the Contact Form

The website includes a contact form that allows visitors to send inquiries directly to you. When someone submits the form:

1. Their information (name, email, phone, message) is sent to your email address
2. They are redirected to a thank-you page
3. You can reply directly to their email from your inbox

## Contact Form Configuration

The contact form uses Nodemailer to send emails. You'll need to update the configuration in the `.env.local` file and the API route.

### Step 1: Update Environment Variables

Edit your `.env.local` file to include your email credentials:

```
# Email configuration
EMAIL_FROM=info@westviewhomesales.com
EMAIL_TO=your-email@example.com
EMAIL_PASSWORD=your-email-password
```

### Step 2: Update the API Route

The contact form API route is located at `src/app/api/contact/route.ts`. You need to update it to use your email configuration:

1. Open the file at `src/app/api/contact/route.ts`
2. Update the following lines:

```typescript
// Line 37-44: Update with your email provider settings
const transporter = nodemailer.createTransport({
  host: 'your-smtp-server.com', // e.g., smtp.gmail.com
  port: 587, // Common ports: 587 (TLS) or 465 (SSL)
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Line 53-54: Update sender and recipient
from: `"Westview Website Contact" <${process.env.EMAIL_FROM}>`,
to: process.env.EMAIL_TO,
```

### Step 3: Email Provider-Specific Setup

#### For Gmail

If using Gmail:
1. Enable "Less secure app access" or
2. Use an "App Password" instead of your regular password
3. Update the code as follows:

```typescript
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

#### For Other Providers

For other email providers, you'll need:
1. SMTP server address
2. Port number
3. Whether to use SSL/TLS
4. Authentication credentials

## Testing the Contact Form

### Method 1: Using the Live Form

1. Start the development server:
   ```bash
   cd westview-website
   bun run dev
   ```

2. Navigate to the Contact page
3. Fill out the form with test information
4. Submit the form
5. Check your email inbox for the test message
6. Verify you are redirected to the thank-you page

### Method 2: Using API Testing Tools

You can test the API endpoint directly:

1. Start the development server
2. Use a tool like curl, Postman, or Insomnia
3. Send a POST request to `/api/contact` with this JSON body:

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "phone": "555-123-4567",
  "message": "This is a test message"
}
```

4. Check for a successful response
5. Verify the email was received

### Method 3: Using Browser Developer Tools

1. Open the website in your browser
2. Open Developer Tools (F12 or right-click and select "Inspect")
3. Go to the Network tab
4. Fill out and submit the contact form
5. Look for the POST request to `/api/contact`
6. Check the response status (should be 200 OK)
7. Check your email inbox

## Troubleshooting Common Issues

### Email Not Being Sent

1. Check console logs for error messages
2. Verify your email credentials are correct in `.env.local`
3. Ensure your email provider allows SMTP access
4. Check if you need to use an app-specific password
5. Verify network connectivity from your server

### Authentication Failed

1. Double-check your email and password
2. For Gmail, make sure you've enabled less secure apps or are using an app password
3. Check if your email provider requires additional security settings

### Form Submission Errors

1. Check browser console for JavaScript errors
2. Verify the API route is correctly implemented
3. Check server logs for any backend errors
4. Ensure all required fields are being submitted

## Production Considerations

When deploying to production:

1. Use environment variables for all sensitive information
2. Consider using a transactional email service like SendGrid or Mailgun for better deliverability
3. Implement rate limiting to prevent form spam
4. Add CAPTCHA protection if spam becomes an issue

## Using SendGrid (Alternative)

The website supports using SendGrid instead of direct SMTP:

1. Sign up for a SendGrid account
2. Create an API key
3. Add the API key to your `.env.local` file:
   ```
   SENDGRID_API_KEY=your_sendgrid_api_key
   ```

4. Update the contact form API route to use SendGrid:
   ```typescript
   // At the top of the file:
   import sgMail from '@sendgrid/mail';

   // Inside the POST function:
   sgMail.setApiKey(process.env.SENDGRID_API_KEY);
   const msg = {
     to: process.env.EMAIL_TO,
     from: process.env.EMAIL_FROM,
     subject: `Website Contact From: ${name}`,
     text: `Name: ${name}...`,
     html: `<h2>New Contact Form Submission</h2>...`,
   };

   await sgMail.send(msg);
   ```
