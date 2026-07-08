import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { resolveGoogleClientId } from '../lib/googleClientId';

interface GoogleSignInButtonProps {
  onSuccess: (credential: string) => void;
  onError?: () => void;
  disabled?: boolean;
}

export function GoogleSignInButton({
  onSuccess,
  onError,
  disabled = false,
}: GoogleSignInButtonProps) {
  const clientId = resolveGoogleClientId();
  if (!clientId) return null;

  return (
    <div className={disabled ? 'pointer-events-none opacity-50' : ''}>
      <GoogleLogin
        onSuccess={(response: CredentialResponse) => {
          if (response.credential) {
            onSuccess(response.credential);
          } else {
            onError?.();
          }
        }}
        onError={() => onError?.()}
        useOneTap={false}
        text="continue_with"
        shape="rectangular"
        theme="outline"
        size="large"
        width="384"
      />
    </div>
  );
}
