import { LoginPage } from '@humain-foundation/ui';
import { redirect } from 'next/navigation';

export default function LoginRoute() {
  return (
    <LoginPage
      variant="simple"
      onEmailSubmit={async (email, password) => {
        'use server';
        // TODO: wire to next-auth signIn
        redirect('/dashboard');
      }}
      onForgotPasswordClick={() => {}}
      onSignUpLinkClick={() => {}}
      loading={false}
    />
  );
}
