import { useLanguage } from '../contexts/useLanguage';

export function AuthDivider() {
  const { t } = useLanguage();
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-gray-200" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="bg-white px-3 text-gray-500">{t('authOrDivider')}</span>
      </div>
    </div>
  );
}
