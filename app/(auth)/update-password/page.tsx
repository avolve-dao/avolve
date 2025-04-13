import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function UpdatePassword() {
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
          view="update_password"
          localization={{
            variables: {
              update_password: {
                password_label: 'New Password',
                button_label: 'Update password',
                loading_button_label: 'Updating password...',
                confirmation_text: 'Your password has been updated'
              }
            }
          }}
        />
      </div>
    </div>
  )
}
