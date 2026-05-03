'use client';

import { useRouter } from 'next/navigation';
import { LoginPage } from '@humain-foundation/ui';

export default function LoginRoute() {
  const router = useRouter();

  return (
    <LoginPage
      variant="simple"
      onEmailSubmit={async (_email, _password) => {
        // TODO: wire to next-auth signIn
        router.push('/dashboard');
      }}
      onForgotPasswordClick={() => {}}
      onSignUpLinkClick={() => {}}
      loading={false}
    />
  );
}
