import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Email templates
export enum EmailTemplate {
  INVITATION = 'invitation',
  INVITATION_CLAIMED = 'invitation_claimed',
  FEATURE_UNLOCKED = 'feature_unlocked',
  INVITATION_REQUEST_RECEIVED = 'invitation_request_received',
  INVITATION_REQUEST_APPROVED = 'invitation_request_approved',
}

// Email data interface
export interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
  text?: string;
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
}

/**
 * Send an email using Resend
 * @param emailData - Email data to send
 * @returns Promise with the send result
 */
export async function sendEmail(emailData: EmailData) {
  try {
    const { to, subject, html, text, cc, bcc, replyTo } = emailData;
    const from =
      emailData.from || `Avolve <${process.env.EMAIL_FROM || 'notifications@avolve.io'}>`;

    const result = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
      cc,
      bcc,
      reply_to: replyTo,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

/**
 * Generate invitation email HTML
 * @param code - Invitation code
 * @param recipientName - Name of the recipient (optional)
 * @returns HTML string for the email
 */
export function generateInvitationEmailHtml(code: string, recipientName?: string) {
  const greeting = recipientName ? `Hello ${recipientName},` : 'Hello,';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Your Invitation to Avolve</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            max-width: 150px;
            margin-bottom: 20px;
          }
          .invitation-code {
            background-color: #f5f7fa;
            border: 1px solid #e4e7eb;
            border-radius: 6px;
            padding: 15px;
            margin: 25px 0;
            text-align: center;
            font-size: 24px;
            letter-spacing: 2px;
            font-weight: bold;
            color: #3b82f6;
          }
          .button {
            display: inline-block;
            background-color: #3b82f6;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
          }
          .footer {
            margin-top: 40px;
            font-size: 14px;
            color: #6b7280;
            text-align: center;
            border-top: 1px solid #e4e7eb;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${process.env.NEXT_PUBLIC_SITE_URL}/logo.png" alt="Avolve Logo" class="logo" />
          <h1>You're Invited to Join Avolve!</h1>
        </div>
        
        <p>${greeting}</p>
        
        <p>You've been invited to join Avolve, a community of extraordinary individuals dedicated to personal growth, collective achievement, and building a supercivilization.</p>
        
        <p>Your exclusive invitation code is:</p>
        
        <div class="invitation-code">${code}</div>
        
        <p>To join, simply visit <a href="${process.env.NEXT_PUBLIC_SITE_URL}/signup">our signup page</a> and enter this code during the onboarding process.</p>
        
        <p><strong>This invitation code is unique to you and will expire in 7 days.</strong></p>
        
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/signup" class="button">Join Avolve Now</a>
        </div>
        
        <p>We're excited to welcome you to our community!</p>
        
        <p>Best regards,<br>The Avolve Team</p>
        
        <div class="footer">
          <p>If you didn't request this invitation, please ignore this email.</p>
          <p>&copy; ${new Date().getFullYear()} Avolve. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate feature unlocked email HTML
 * @param featureName - Name of the unlocked feature
 * @param featureDescription - Description of the feature
 * @param userName - Name of the user
 * @returns HTML string for the email
 */
export function generateFeatureUnlockedEmailHtml(
  featureName: string,
  featureDescription: string,
  userName: string
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>You've Unlocked a New Feature!</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            max-width: 150px;
            margin-bottom: 20px;
          }
          .feature-card {
            background-color: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
          }
          .feature-name {
            color: #0284c7;
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .button {
            display: inline-block;
            background-color: #0284c7;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
          }
          .footer {
            margin-top: 40px;
            font-size: 14px;
            color: #6b7280;
            text-align: center;
            border-top: 1px solid #e4e7eb;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${process.env.NEXT_PUBLIC_SITE_URL}/logo.png" alt="Avolve Logo" class="logo" />
          <h1>🎉 You've Unlocked a New Feature! 🎉</h1>
        </div>
        
        <p>Hello ${userName},</p>
        
        <p>Congratulations! You've unlocked a new feature on Avolve:</p>
        
        <div class="feature-card">
          <div class="feature-name">${featureName}</div>
          <p>${featureDescription}</p>
        </div>
        
        <p>This feature is now available in your account. Log in to explore and enjoy your new capabilities!</p>
        
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/features" class="button">Explore Your New Feature</a>
        </div>
        
        <p>Keep up the great work! As you continue to engage with the Avolve community, you'll unlock even more exciting features.</p>
        
        <p>Best regards,<br>The Avolve Team</p>
        
        <div class="footer">
          <p>You're receiving this email because you've unlocked a new feature on Avolve.</p>
          <p>To manage your email preferences, visit your <a href="${process.env.NEXT_PUBLIC_SITE_URL}/settings/notifications">notification settings</a>.</p>
          <p>&copy; ${new Date().getFullYear()} Avolve. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate invitation request received email HTML
 * @param name - Name of the requester
 * @returns HTML string for the email
 */
export function generateInvitationRequestReceivedEmailHtml(name: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Your Invitation Request Has Been Received</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            max-width: 150px;
            margin-bottom: 20px;
          }
          .message-card {
            background-color: #f7fee7;
            border: 1px solid #bef264;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
          }
          .footer {
            margin-top: 40px;
            font-size: 14px;
            color: #6b7280;
            text-align: center;
            border-top: 1px solid #e4e7eb;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${process.env.NEXT_PUBLIC_SITE_URL}/logo.png" alt="Avolve Logo" class="logo" />
          <h1>We've Received Your Request</h1>
        </div>
        
        <p>Hello ${name},</p>
        
        <p>Thank you for your interest in joining Avolve! We've received your invitation request and it's currently being reviewed by our team.</p>
        
        <div class="message-card">
          <p><strong>What happens next?</strong></p>
          <p>Our team will review your request, and if approved, you'll receive an invitation code via email. This process typically takes 1-3 business days.</p>
        </div>
        
        <p>Avolve is a community of extraordinary individuals dedicated to personal growth, collective achievement, and building a supercivilization. We're selective about our membership to ensure a high-quality experience for everyone.</p>
        
        <p>We appreciate your patience during the review process.</p>
        
        <p>Best regards,<br>The Avolve Team</p>
        
        <div class="footer">
          <p>You're receiving this email because you requested an invitation to join Avolve.</p>
          <p>&copy; ${new Date().getFullYear()} Avolve. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send an invitation email
 * @param email - Recipient email
 * @param code - Invitation code
 * @param name - Recipient name (optional)
 * @returns Promise with the send result
 */
export async function sendInvitationEmail(email: string, code: string, name?: string) {
  const html = generateInvitationEmailHtml(code, name);

  return sendEmail({
    to: email,
    subject: 'Your Exclusive Invitation to Join Avolve',
    html,
    text: `Hello ${name || ''},\n\nYou've been invited to join Avolve! Your invitation code is: ${code}\n\nTo join, visit ${process.env.NEXT_PUBLIC_SITE_URL}/signup and enter this code during the onboarding process.\n\nThis invitation code is unique to you and will expire in 7 days.\n\nBest regards,\nThe Avolve Team`,
  });
}

/**
 * Send a feature unlocked email
 * @param email - Recipient email
 * @param featureName - Name of the unlocked feature
 * @param featureDescription - Description of the feature
 * @param userName - Name of the user
 * @returns Promise with the send result
 */
export async function sendFeatureUnlockedEmail(
  email: string,
  featureName: string,
  featureDescription: string,
  userName: string
) {
  const html = generateFeatureUnlockedEmailHtml(featureName, featureDescription, userName);

  return sendEmail({
    to: email,
    subject: `You've Unlocked ${featureName} on Avolve!`,
    html,
    text: `Hello ${userName},\n\nCongratulations! You've unlocked a new feature on Avolve: ${featureName}\n\n${featureDescription}\n\nThis feature is now available in your account. Log in to explore and enjoy your new capabilities!\n\nBest regards,\nThe Avolve Team`,
  });
}

/**
 * Send an invitation request received email
 * @param email - Recipient email
 * @param name - Recipient name
 * @returns Promise with the send result
 */
export async function sendInvitationRequestReceivedEmail(email: string, name: string) {
  const html = generateInvitationRequestReceivedEmailHtml(name);

  return sendEmail({
    to: email,
    subject: 'Your Avolve Invitation Request Has Been Received',
    html,
    text: `Hello ${name},\n\nThank you for your interest in joining Avolve! We've received your invitation request and it's currently being reviewed by our team.\n\nWhat happens next?\nOur team will review your request, and if approved, you'll receive an invitation code via email. This process typically takes 1-3 business days.\n\nBest regards,\nThe Avolve Team`,
  });
}
