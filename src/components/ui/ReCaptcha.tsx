import { useRef, forwardRef, useImperativeHandle } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

// Get the site key from environment variables
// You need to add VITE_RECAPTCHA_SITE_KEY to your .env file
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Default is Google's test key

export interface ReCaptchaHandle {
  getValue: () => string | null;
  reset: () => void;
}

interface ReCaptchaProps {
  onChange?: (token: string | null) => void;
  onExpired?: () => void;
  onErrored?: () => void;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact';
}

export const ReCaptcha = forwardRef<ReCaptchaHandle, ReCaptchaProps>(
  ({ onChange, onExpired, onErrored, theme = 'light', size = 'normal' }, ref) => {
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    useImperativeHandle(ref, () => ({
      getValue: () => recaptchaRef.current?.getValue() || null,
      reset: () => recaptchaRef.current?.reset(),
    }));

    return (
      <div className="flex justify-center">
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={RECAPTCHA_SITE_KEY}
          onChange={onChange}
          onExpired={onExpired}
          onErrored={onErrored}
          theme={theme}
          size={size}
        />
      </div>
    );
  }
);

ReCaptcha.displayName = 'ReCaptcha';
