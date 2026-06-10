import { useState, useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { LegalPageContentView } from '../../components/LegalPageContentView';
import { useLanguage } from '../../contexts/useLanguage';
import { legalPagesApi } from '../../api/legalPages';
import { getLegalPageDefaults } from '../../data/legalPageDefaults';
import type { LegalPageContentData, LegalSection } from '../../types/api';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

type PageKey = 'privacy-policy' | 'rental-terms';
type LangKey = 'lt' | 'en' | 'ru';

interface SectionForm {
  title: string;
  paragraphsText: string;
  bulletsText: string;
}

interface LegalFormState {
  intro: string;
  sections: SectionForm[];
  note: string;
}

function linesToText(lines?: string[]) {
  return (lines || []).join('\n');
}

function textToLines(text: string) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function contentToForm(content: LegalPageContentData): LegalFormState {
  return {
    intro: content.intro || '',
    note: content.note || '',
    sections: (content.sections || []).map((section) => ({
      title: section.title || '',
      paragraphsText: linesToText(section.paragraphs),
      bulletsText: linesToText(section.bullets),
    })),
  };
}

function formToContent(form: LegalFormState): LegalPageContentData {
  const sections: LegalSection[] = form.sections
    .filter((section) => section.title.trim())
    .map((section) => ({
      title: section.title.trim(),
      paragraphs: textToLines(section.paragraphsText),
      bullets: textToLines(section.bulletsText),
    }));

  return {
    intro: form.intro,
    sections,
    ...(form.note.trim() ? { note: form.note } : {}),
  };
}

const emptyForm = (): LegalFormState => ({
  intro: '',
  sections: [{ title: '', paragraphsText: '', bulletsText: '' }],
  note: '',
});

export function AdminLegalPagesPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [pageKey, setPageKey] = useState<PageKey>('privacy-policy');
  const [lang, setLang] = useState<LangKey>('lt');
  const [form, setForm] = useState<LegalFormState>(emptyForm());
  const [message, setMessage] = useState<string | null>(null);

  const { data: allPages, isLoading } = useQuery({
    queryKey: ['legal-pages-admin'],
    queryFn: legalPagesApi.getAll,
  });

  useEffect(() => {
    const existing = allPages?.find((p) => p.pageKey === pageKey && p.language === lang);
    if (existing?.content) {
      setForm(contentToForm(existing.content));
    } else {
      setForm(contentToForm(getLegalPageDefaults(pageKey, lang)));
    }
  }, [allPages, pageKey, lang]);

  const previewContent = useMemo(() => formToContent(form), [form]);

  const saveMutation = useMutation({
    mutationFn: () => legalPagesApi.upsert(pageKey, lang, formToContent(form)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-pages-admin'] });
      queryClient.invalidateQueries({ queryKey: ['legal-page', pageKey, lang] });
      setMessage(t('legalPageSaved'));
    },
    onError: () => setMessage(t('pricing.admin.saveFailed')),
  });

  const updateSection = (index: number, patch: Partial<SectionForm>) => {
    const sections = [...form.sections];
    sections[index] = { ...sections[index], ...patch };
    setForm({ ...form, sections });
  };

  const loadDefaults = () => {
    setForm(contentToForm(getLegalPageDefaults(pageKey, lang)));
  };

  const pageTitle =
    pageKey === 'privacy-policy' ? t('privacyPolicyPage') : t('rentalTermsPage');

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">{t('manageLegalPages')}</h2>
      {message && (
        <div className="mb-4">
          <Alert
            type={message === t('pricing.admin.saveFailed') ? 'error' : 'success'}
            message={message}
            onClose={() => setMessage(null)}
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {(['privacy-policy', 'rental-terms'] as PageKey[]).map((key) => (
          <Button key={key} variant={pageKey === key ? 'primary' : 'ghost'} onClick={() => setPageKey(key)}>
            {key === 'privacy-policy' ? t('privacyPolicyPage') : t('rentalTermsPage')}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {(['lt', 'en', 'ru'] as LangKey[]).map((l) => (
          <Button key={l} variant={lang === l ? 'secondary' : 'ghost'} onClick={() => setLang(l)}>
            {l.toUpperCase()}
          </Button>
        ))}
        <Button type="button" variant="ghost" onClick={loadDefaults}>
          {t('loadDefaultLegalContent')}
        </Button>
      </div>

      {isLoading ? (
        <p className="text-gray-500">{t('loading')}</p>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          <Card className="p-6 space-y-6">
            <h3 className="text-lg font-semibold">{t('legalPageEditor')}</h3>

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
                  <h4 className="font-medium">{t('sectionTitle')} #{index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={form.sections.length <= 1}
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
                    className="w-full border rounded-lg p-3 min-h-[100px] font-mono text-sm"
                    value={section.paragraphsText}
                    onChange={(e) => updateSection(index, { paragraphsText: e.target.value })}
                    placeholder={t('paragraphsPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('bulletsLabel')}</label>
                  <textarea
                    className="w-full border rounded-lg p-3 min-h-[100px] font-mono text-sm"
                    value={section.bulletsText}
                    onChange={(e) => updateSection(index, { bulletsText: e.target.value })}
                    placeholder={t('bulletsPlaceholder')}
                  />
                </div>
              </Card>
            ))}

            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                setForm({
                  ...form,
                  sections: [...form.sections, { title: '', paragraphsText: '', bulletsText: '' }],
                })
              }
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              {t('addSection')}
            </Button>

            {pageKey === 'rental-terms' && (
              <div>
                <label className="block text-sm font-medium mb-2">{t('noteText')}</label>
                <textarea
                  className="w-full border rounded-lg p-3 min-h-[60px]"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                />
              </div>
            )}

            <Button onClick={() => saveMutation.mutate()} isLoading={saveMutation.isPending}>
              {t('save')}
            </Button>
          </Card>

          <Card className="p-6 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">{t('legalPagePreview')}</h3>
            <LegalPageContentView content={previewContent} title={pageTitle} className="text-sm" />
          </Card>
        </div>
      )}
    </div>
  );
}
