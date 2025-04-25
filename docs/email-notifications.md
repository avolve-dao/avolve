# Avolve Email Notification System

## Overview

The Avolve platform uses email notifications to keep users informed about important events, feature unlocks, and community activity. This document explains how the email notification system works, what types of emails are sent, and how to manage email preferences.

## Email Types

### Onboarding and Account Emails

- **Welcome Email**: Sent when a user first signs up
- **Invitation Email**: Sent when an invitation code is created for a specific email
- **Invitation Claimed Notification**: Sent to invitation creators when their invitation is used
- **Email Verification**: Sent to verify a user's email address
- **Password Reset**: Sent when a user requests a password reset

### Feature and Progress Emails

- **Feature Unlock**: Sent when a user unlocks a new feature
- **Achievement Notification**: Sent when a user reaches a significant milestone
- **Progress Update**: Periodic summary of user progress (optional)

### Community Emails

- **Mention Notification**: Sent when a user is mentioned in a post or comment
- **Reply Notification**: Sent when someone replies to a user's post or comment
- **Connection Request**: Sent when another user wants to connect

### Administrative Emails

- **Announcement**: Important platform-wide announcements
- **Waitlist Status**: Updates on waitlist position and invitation status
- **Account Status**: Notifications about account changes or issues

## Technical Implementation

### Email Service

The Avolve platform uses [Resend](https://resend.com) for sending emails. The email service is implemented in:

```
/lib/email/emailService.ts
```

### Email Templates

Email templates are stored in:

```
/lib/email/templates/
```

Each template follows a consistent structure with:

- Header with Avolve logo
- Main content section
- Footer with unsubscribe link and company information

### API Endpoints

- `POST /api/email/send`: Sends a custom email
- `POST /api/email/feature-unlock`: Sends a feature unlock notification
- `POST /api/email/invitation`: Sends an invitation email

## User Preferences

Users can manage their email preferences in their account settings:

1. **Email Types**: Toggle specific types of emails on/off
2. **Email Frequency**: Choose frequency for digest-style emails
3. **Unsubscribe**: Option to unsubscribe from all non-essential emails

## Admin Guide

### Creating and Managing Email Templates

1. **Edit Templates**:

   - Templates are React components in `/lib/email/templates/`
   - Each template has a clear structure and customizable elements
   - Use the existing design system components for consistency

2. **Testing Emails**:

   - Use the email preview tool in the admin dashboard
   - Send test emails to verify formatting and content
   - Check how emails render on different devices and clients

3. **Email Analytics**:
   - Track open rates, click rates, and unsubscribe rates
   - Monitor delivery issues and bounces
   - Adjust email strategy based on engagement metrics

## Best Practices

### Email Content

1. **Clear Subject Lines**:

   - Keep subject lines concise and descriptive
   - Include the Avolve brand name for recognition
   - Avoid spam trigger words and excessive punctuation

2. **Email Body**:

   - Start with the most important information
   - Use short paragraphs and bullet points for readability
   - Include a clear call-to-action when appropriate

3. **Timing and Frequency**:
   - Avoid sending too many emails in a short period
   - Consider user time zones when scheduling emails
   - Batch notifications when possible to reduce email volume

### Technical Considerations

1. **Email Deliverability**:

   - Properly configure SPF, DKIM, and DMARC records
   - Monitor spam complaints and address issues promptly
   - Regularly clean email lists of bounces and unsubscribes

2. **Responsive Design**:

   - Ensure emails display properly on mobile devices
   - Use appropriate font sizes and button dimensions
   - Test on various email clients before sending

3. **Accessibility**:
   - Include alt text for images
   - Maintain sufficient color contrast
   - Provide plain text alternatives

## Troubleshooting

### Common Issues

1. **Emails Not Being Received**:

   - Check spam/junk folders
   - Verify email address is correct and verified
   - Check email service logs for delivery issues

2. **Formatting Problems**:

   - Test emails in multiple clients (Gmail, Outlook, etc.)
   - Simplify complex layouts that might break
   - Use inline CSS for consistent styling

3. **High Unsubscribe Rates**:
   - Review email frequency and relevance
   - Ensure content provides clear value
   - Respect user preferences for email types

## Integration with Other Systems

The email notification system integrates with:

1. **Invitation System**: Sends emails when invitations are created or claimed
2. **Feature Flags**: Sends notifications when features are unlocked
3. **User Activity**: Sends notifications about mentions, replies, and connections
4. **Analytics**: Tracks email engagement and correlates with platform usage

## Environment Configuration

The email service requires the following environment variables:

```
RESEND_API_KEY=your_api_key
EMAIL_FROM=noreply@avolve.io
EMAIL_REPLY_TO=support@avolve.io
```

These should be configured in your `.env` file and in your deployment environment.
