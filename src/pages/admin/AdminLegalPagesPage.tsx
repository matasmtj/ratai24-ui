import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { useLanguage } from '../../contexts/useLanguage';
import { legalPagesApi } from '../../api/legalPages';
import type { LegalPageContentData, LegalSection } from '../../types/api';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

type PageKey = 'privacy-policy' | 'rental-terms';
type LangKey = 'lt' | 'en' | 'ru';

const emptyContent: LegalPageContentData = {
  intro: '',
  sections: [{ title: '', paragraphs: [''] }],
  note: '',
};

export function AdminLegalPagesPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [pageKey, setPageKey] = useState<PageKey>('privacy-policy');
  const [lang, setLang] = useState<LangKey>('lt');
  const [form, setForm] = useState<LegalPageContentData>(emptyContent);
  const [message, setMessage] = useState<string | null>(null);

  const { data: allPages } = useQuery({
    queryKey: ['legal-pages-admin'],
    queryFn: legalPagesApi.getAll,
  });

  useEffect(() => {
    const existing = allPages?.find((p) => p.pageKey === pageKey && p.language === lang);
    if (existing?.content) {
      setForm(existing.content);
    } else {
      setForm(emptyContent);
    }
  }, [allPages, pageKey, lang]);

  const saveMutation = useMutation({
    mutationFn: () => legalPagesApi.upsert(pageKey, lang, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-pages-admin'] });
      queryClient.invalidateQueries({ queryKey: ['legal-page', pageKey, lang] });
      setMessage(t('save'));
    },
    onError: () => setMessage(t('pricing.admin.saveFailed')),
  });

  const updateSection = (index: number, patch: Partial<LegalSection>) => {
    const sections = [...form.sections];
    sections[index] = { ...sections[index], ...patch };
    setForm({ ...form, sections });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">{t('manageLegalPages')}</h2>
      {message && (
        <div className="mb-4">
          <Alert type="success" message={message} onClose={() => setMessage(null)} />
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {(['privacy-policy', 'rental-terms'] as PageKey[]).map((key) => (
          <Button key={key} variant={pageKey === key ? 'primary' : 'ghost'} onClick={() => setPageKey(key)}>
            {key === 'privacy-policy' ? t('privacyPolicyPage') : t('rentalTermsPage')}
          </Button>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        {(['lt', 'en', 'ru'] as LangKey[]).map((l) => (
          <Button key={l} variant={lang === l ? 'secondary' : 'ghost'} onClick={() => setLang(l)}>
            {l.toUpperCase()}
          </Button>
        ))}
      </div>

      <Card className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">{t('introText')}</label>
          <textarea
            className="w-full border rounded-lg p-3 min-h-[100px]"
            value={form.intro}
            onChange={(e) => setForm({ ...form, intro: e.target.value })}
          />
        </div>

        {form.sections.map((section, index) => (
          <Card key={index} className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">{t('sectionTitle')} #{index + 1}</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setForm({ ...form, sections: form.sections.filter((_, i) => i !== index) })}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
            <Input
              label={t('sectionTitle')}
              value={section.title}
              onChange={(e) => updateSection(index, { title: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium mb-2">{t('paragraphsLabel')}</label>
              <textarea
                className="w-full border rounded-lg p-3 min-h-[80px]"
                value={(section.paragraphs || []).join('\n')}
                onChange={(e) => updateSection(index, { paragraphs: e.target.value.split('\n').filter(Boolean) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('bulletsLabel')}</label>
              <textarea
                className="w-full border rounded-lg p-3 min-h-[80px]"
                value={(section.bullets || []).join('\n')}
                onChange={(e) => updateSection(index, { bullets: e.target.value.split('\n').filter(Boolean) })}
              />
            </div>
          </Card>
        ))}

        <Button
          type="button"
          variant="ghost"
          onClick={() => setForm({ ...form, sections: [...form.sections, { title: '', paragraphs: [''] }] })}
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          {t('addSection')}
        </Button>

        {pageKey === 'rental-terms' && (
          <div>
            <label className="block text-sm font-medium mb-2">{t('noteText')}</label>
            <textarea
              className="w-full border rounded-lg p-3 min-h-[60px]"
              value={form.note || ''}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </div>
        )}

        <Button onClick={() => saveMutation.mutate()} isLoading={saveMutation.isPending}>
          {t('save')}
        </Button>
      </Card>
    </div>
  );
}
