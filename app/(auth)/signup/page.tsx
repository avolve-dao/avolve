import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function SignUp() {
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
          view="sign_up"
          localization={{
            variables: {
              sign_up: {
                email_label: 'Email',
                password_label: 'Password',
                button_label: 'Sign up',
                loading_button_label: 'Signing up...',
                social_provider_text: 'Sign up with {{provider}}',
                link_text: 'Already have an account? Sign in',
                confirmation_text: 'Check your email for the confirmation link'
              }
            }
          }}
        />
      </div>
    </div>
  )
}
