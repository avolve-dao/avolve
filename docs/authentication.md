# Authentication Documentation

This document provides detailed information about the authentication flows and email templates used in the Avolve application.

## Authentication Flows

Avolve uses Supabase Authentication for user management, providing several authentication flows:

### Email/Password Authentication

The primary authentication method using email and password:

1. **Sign Up**: Users register with email and password
2. **Email Confirmation**: Users receive a confirmation email to verify their address
3. **Login**: Users sign in with verified credentials
4. **Password Reset**: Users can request a password reset via email

### Magic Link Authentication

Passwordless authentication using email links:

1. **Request Magic Link**: User enters their email
2. **Email with Link**: User receives an email with a secure login link
3. **Automatic Login**: User clicks the link and is automatically logged in

### Session Management

- Sessions are stored in HTTP-only cookies for security
- Session expiry is set to 1 hour by default (configurable)
- Refresh tokens enable seamless session extension

## Email Templates

Avolve uses customized Supabase email templates for various authentication flows. All templates follow a consistent design using the Inter font and zinc color palette.

### 1. Confirm Signup Template

Sent to users after registration to verify their email address.

**Subject**: Confirm your email for Avolve

**Template Variables**:
- `{{ .ConfirmationURL }}`: The URL to confirm the email address
- `{{ .SiteURL }}`: The application URL
- `{{ .Email }}`: The user's email address

**Design Elements**:
- Clean, minimalist design with zinc color palette
- Clear call-to-action button
- Security information about link expiration (24 hours)
- No images to avoid spam filters

### 2. Invite User Template

Sent when inviting users to join the platform.

**Subject**: You've been invited to join Avolve

**Template Variables**:
- `{{ .InviteURL }}`: The URL to accept the invitation
- `{{ .SiteURL }}`: The application URL
- `{{ .Email }}`: The invitee's email address

**Design Elements**:
- Welcoming message explaining the invitation
- Clear call-to-action button
- Information about who sent the invitation

### 3. Magic Link Template

Sent when users request a passwordless login.

**Subject**: Your magic link for Avolve

**Template Variables**:
- `{{ .MagicLinkURL }}`: The URL for passwordless login
- `{{ .SiteURL }}`: The application URL
- `{{ .Email }}`: The user's email address

**Design Elements**:
- Brief explanation of the magic link purpose
- Prominent magic link button
- Security warning about not sharing the link
- Link expiration information (10 minutes)

### 4. Change Email Address Template

Sent when users request to change their email address.

**Subject**: Confirm your new email for Avolve

**Template Variables**:
- `{{ .ChangeEmailURL }}`: The URL to confirm the email change
- `{{ .SiteURL }}`: The application URL
- `{{ .NewEmail }}`: The new email address
- `{{ .CurrentEmail }}`: The current email address

**Design Elements**:
- Clear explanation of the email change request
- Security information about the request
- Prominent confirmation button
- Instructions to ignore if not requested

### 5. Reset Password Template

Sent when users request a password reset.

**Subject**: Reset your password for Avolve

**Template Variables**:
- `{{ .ResetURL }}`: The URL to reset the password
- `{{ .SiteURL }}`: The application URL
- `{{ .Email }}`: The user's email address

**Design Elements**:
- Simple instructions for password reset
- Clear call-to-action button
- Security information about link expiration (10 minutes)
- Instructions to ignore if not requested

### 6. Reauthentication Template

Sent when users need to reauthenticate for security-sensitive actions.

**Subject**: Verify your identity for Avolve

**Template Variables**:
- `{{ .ReauthURL }}`: The URL to reauthenticate
- `{{ .SiteURL }}`: The application URL
- `{{ .Email }}`: The user's email address

**Design Elements**:
- Explanation of the security verification
- Information about the action requiring verification
- Clear verification button
- Link expiration information (10 minutes)

## Email Template Design Guidelines

All email templates follow these design guidelines:

1. **Typography**:
   - Primary font: Inter (system fallback: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif)
   - Font sizes: 16px for body text, 20px for headings

2. **Colors**:
   - Primary: zinc-800 (#27272a) for text
   - Secondary: zinc-600 (#52525b) for secondary text
   - Accent: zinc-500 (#71717a) for borders
   - Background: white (#ffffff)
   - Button: zinc-800 (#27272a) with white text

3. **Layout**:
   - Maximum width: 600px
   - Responsive design for mobile compatibility
   - Adequate white space for readability
   - Clear visual hierarchy

4. **Security Features**:
   - Clear expiration times for all action links
   - Instructions to ignore emails if not requested
   - No request for sensitive information
   - Footer with contact information

## Configuring Email Templates

To customize the email templates:

1. Go to the Supabase Dashboard for your project
2. Navigate to Authentication > Email Templates
3. Select the template you want to customize
4. Edit the HTML and subject line
5. Save your changes

### Example Template HTML

Here's an example of the Reset Password template HTML:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reset your password</title>
  <style>
    body {
      font-family: Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
      margin: 0;
      padding: 0;
      color: #27272a;
      background-color: #f4f4f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
      background-color: #ffffff;
    }
    .header {
      margin-bottom: 30px;
    }
    .title {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 10px;
    }
    .content {
      font-size: 16px;
      line-height: 1.5;
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      background-color: #27272a;
      color: #ffffff;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 500;
    }
    .footer {
      margin-top: 40px;
      font-size: 14px;
      color: #52525b;
    }
    .expiration {
      margin-top: 20px;
      padding: 15px;
      background-color: #f4f4f5;
      border-radius: 4px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title">Reset your password</div>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>Someone requested a password reset for your Avolve account. If this was you, click the button below to set a new password. If you didn't request this, you can safely ignore this email.</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="{{ .ResetURL }}" class="button">Reset Password</a>
      </p>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all;">{{ .ResetURL }}</p>
      <div class="expiration">
        <strong>Important:</strong> This link will expire in 10 minutes for security reasons.
      </div>
    </div>
    <div class="footer">
      <p>Avolve Team</p>
      <p>This email was sent to {{ .Email }}</p>
    </div>
  </div>
</body>
</html>
```

## Security Considerations

1. **CSRF Protection**:
   - All authentication forms include CSRF tokens
   - Tokens are validated on form submission

2. **Rate Limiting**:
   - Authentication endpoints are rate-limited to prevent brute force attacks
   - Configurable in the middleware.ts file

3. **Secure Cookies**:
   - HTTP-only cookies for session storage
   - Secure flag in production environments
   - SameSite policy to prevent CSRF attacks

4. **Email Security**:
   - No sensitive information in emails
   - Clear expiration times for action links
   - Instructions to contact support if suspicious activity is detected

## Troubleshooting Authentication Issues

### Common Issues and Solutions

1. **Email Not Received**:
   - Check spam/junk folders
   - Verify the email address is correct
   - Check if email verification is enabled in Supabase settings

2. **Link Expired**:
   - Request a new link
   - Links expire after a set time for security (10 minutes for password reset, 24 hours for email confirmation)

3. **Authentication Failed**:
   - Verify credentials are correct
   - Check if the account exists
   - Ensure email is verified if verification is required

4. **Session Issues**:
   - Clear browser cookies and try again
   - Check for browser extensions blocking cookies
   - Verify the Supabase configuration is correct
