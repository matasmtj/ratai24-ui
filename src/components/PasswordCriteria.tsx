import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useLanguage } from '../contexts/useLanguage';
import { getPasswordChecks } from '../lib/passwordRequirements';

type Props = {
  password: string;
  className?: string;
};

export function PasswordCriteria({ password, className = '' }: Props) {
  const { t } = useLanguage();
  const checks = getPasswordChecks(password);

  const rows: { ok: boolean; label: string }[] = [
    { ok: checks.minLength, label: t('passwordReqMinLength') },
    { ok: checks.hasLetter, label: t('passwordReqLetter') },
    { ok: checks.hasDigit, label: t('passwordReqDigit') },
  ];

  return (
    <div className={`rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 ${className}`}>
      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
        {t('passwordRequirementsTitle')}
      </p>
      <ul className="text-sm space-y-1.5">
        {rows.map(({ ok, label }) => (
          <li
            key={label}
            className={`flex items-center gap-2 ${ok ? 'text-green-700' : 'text-gray-500'}`}
          >
            {ok ? (
              <CheckCircleIcon className="h-5 w-5 shrink-0 text-green-600" aria-hidden />
            ) : (
              <span
                className="h-5 w-5 shrink-0 rounded-full border-2 border-gray-300"
                aria-hidden
              />
            )}
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
