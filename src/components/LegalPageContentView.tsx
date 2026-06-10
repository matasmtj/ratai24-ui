import type { LegalPageContentData } from '../types/api';

interface LegalPageContentViewProps {
  content: LegalPageContentData;
  title: string;
  email?: string;
  className?: string;
}

function withEmail(text: string, email: string) {
  return text.replaceAll('{email}', email);
}

export function LegalPageContentView({
  content,
  title,
  email = 'info@ratai24.lt',
  className = '',
}: LegalPageContentViewProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      {content.intro && <p className="text-gray-700 whitespace-pre-line">{content.intro}</p>}
      {content.sections.map((section, index) => (
        <section key={`${section.title}-${index}`} className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
          {section.paragraphs?.map((paragraph, pIndex) => (
            <p key={pIndex} className="text-gray-700 whitespace-pre-line">
              {withEmail(paragraph, email)}
            </p>
          ))}
          {section.bullets && section.bullets.length > 0 && (
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              {section.bullets.map((bullet, bIndex) => (
                <li key={bIndex}>{withEmail(bullet, email)}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
      {content.note && (
        <p className="text-gray-600 italic border-t pt-4 whitespace-pre-line">{content.note}</p>
      )}
    </div>
  );
}
