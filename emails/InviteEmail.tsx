import { Html } from '@react-email/html';
import { Button } from '@react-email/button';
import { Container } from '@react-email/container';
import { Text } from '@react-email/text';
import { Section } from '@react-email/section';
import * as React from 'react';

interface InviteEmailProps {
  confirmationUrl: string;
  email: string;
}

export default function InviteEmail({ confirmationUrl, email }: InviteEmailProps) {
  return (
    <Html lang="en">
      <Section style={{ backgroundColor: '#f4f4f5', padding: '20px' }}>
        <Container style={{ maxWidth: 600, margin: '0 auto', backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <Section style={{ backgroundColor: '#18181b', padding: '30px 0', textAlign: 'center' }}>
            <Text as="h1" style={{ color: '#fff', margin: 0, fontSize: 24, fontWeight: 600 }}>You're Invited</Text>
          </Section>
          <Section style={{ padding: '35px 30px', color: '#27272a' }}>
            <Text>Hello,</Text>
            <Text>You've been invited to join our platform. To accept this invitation and create your account, please click the button below:</Text>
            <div style={{ textAlign: 'center' }}>
              <Button href={confirmationUrl} style={{ backgroundColor: '#18181b', color: '#fff', padding: '12px 30px', borderRadius: 6, fontWeight: 500, fontSize: 16, margin: '20px 0', textAlign: 'center', border: '1px solid transparent', textDecoration: 'none', display: 'inline-block' }}>Accept Invitation</Button>
            </div>
            <div style={{ margin: '25px 0' }} />
            <Text>If the button doesn't work, you can also copy and paste this link into your browser:</Text>
            <Text><a href={confirmationUrl} style={{ wordBreak: 'break-all', color: '#3f3f46', textDecoration: 'underline', fontWeight: 500 }}>{confirmationUrl}</a></Text>
            <div style={{ margin: '25px 0' }} />
            <div style={{ backgroundColor: '#f4f4f5', padding: 15, borderRadius: 6, borderLeft: '4px solid #71717a' }}>
              <Text style={{ margin: 0, color: '#27272a' }}><strong>Important:</strong> This invitation will expire in 24 hours.</Text>
            </div>
          </Section>
          <Section style={{ backgroundColor: '#f4f4f5', padding: '20px 30px', fontSize: 14, color: '#71717a', borderTop: '1px solid #e4e4e7' }}>
            <Text>This email was sent to {email}</Text>
          </Section>
        </Container>
      </Section>
    </Html>
  );
}
