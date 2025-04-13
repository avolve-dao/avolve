import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function ResetPassword() {
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
          view="forgotten_password"
          localization={{
            variables: {
              forgotten_password: {
                email_label: 'Email',
                button_label: 'Send reset instructions',
                loading_button_label: 'Sending reset instructions...',
                confirmation_text: 'Check your email for the password reset link',
                link_text: 'Back to sign in'
              }
            }
          }}
        />
      </div>
    </div>
  )
}
