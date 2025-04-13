import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function Verify() {
  const supabase = createClientComponentClient()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="w-full max-w-md">
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="dark"
          providers={['google', 'github']}
          redirectTo={`${location.origin}/auth/callback`}
          view="verify_otp"
          localization={{
            variables: {
              verify_otp: {
                email_input_label: 'Email',
                token_input_label: 'Verification code',
                button_label: 'Verify',
                loading_button_label: 'Verifying...',
                confirmation_text: 'Your email has been verified',
                link_text: 'Back to sign in'
              }
            }
          }}
        />
      </div>
    </div>
  )
}
