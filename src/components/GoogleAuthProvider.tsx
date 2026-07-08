import { type ReactNode } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useLanguage } from '../contexts/useLanguage';
import { resolveGoogleClientId } from '../lib/googleClientId';

export function GoogleAuthProvider({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const clientId = resolveGoogleClientId();

  if (!clientId) {
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider key={language} clientId={clientId} locale={language}>
      {children}
    </GoogleOAuthProvider>
  );
}
